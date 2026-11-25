import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> Optional[str]:
        """Generate response from external AI model."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass


class OpenAICompatibleProvider(BaseAIProvider):
    def __init__(
        self,
        api_key: str,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 30.0,
        provider_label: str = "openai",
    ):
        self._api_key = api_key
        self._model = model or "gpt-4o-mini"
        self._base_url = (base_url or "https://api.openai.com/v1").rstrip("/")
        self._timeout = timeout
        self._provider_label = provider_label

    @property
    def provider_name(self) -> str:
        return f"{self._provider_label}:{self._model}"

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        formatted_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            formatted_messages.append({"role": m["role"], "content": m["content"]})

        payload = {
            "model": self._model,
            "messages": formatted_messages,
            "max_tokens": settings.AI_MAX_TOKENS,
            "temperature": 0.4,
        }

        url = f"{self._base_url}/chat/completions"
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            choices = data.get("choices", [])
            if choices and "message" in choices[0]:
                return choices[0]["message"].get("content", "").strip()
            return None


class GeminiProvider(BaseAIProvider):
    def __init__(
        self,
        api_key: str,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 45.0,
    ):
        self._api_key = api_key
        raw_model = (model or "gemini-3-flash-preview").strip()
        self._model = raw_model.replace("models/", "")
        self._active_model = self._model
        self._base_url = (base_url or "https://generativelanguage.googleapis.com/v1beta").rstrip("/")
        self._timeout = timeout

    @property
    def provider_name(self) -> str:
        return f"gemini:{self._active_model}"

    async def _execute_request(
        self,
        model_name: str,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> Optional[str]:
        contents = []
        for m in messages:
            role = "user" if m.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

        url = f"{self._base_url}/models/{model_name}:generateContent"
        headers = {
            "x-goog-api-key": self._api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": settings.AI_MAX_TOKENS,
                "temperature": 0.4,
            },
        }

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    cand = candidates[0]
                    finish_reason = cand.get("finishReason", "STOP")

                    if finish_reason == "SAFETY":
                        raise RuntimeError("Gemini generation stopped by content safety policy.")
                    elif finish_reason == "RECITATION":
                        raise RuntimeError("Gemini generation stopped by content recitation check.")

                    parts = cand.get("content", {}).get("parts", [])
                    # Concatenate all non-thought text parts to prevent truncation of multi-part chunks
                    text_parts = [
                        p.get("text", "")
                        for p in parts
                        if isinstance(p, dict) and p.get("text") and not p.get("thought", False)
                    ]
                    full_text = "".join(text_parts).strip()

                    if finish_reason == "MAX_TOKENS":
                        logger.warning(
                            "Gemini model '%s' reached maximum output token limit (%d). Appending user notice.",
                            model_name,
                            settings.AI_MAX_TOKENS,
                        )
                        full_text += "\n\n*(Note: This response reached the maximum response length limit. You can ask me to continue with 'continue where you left off'.)*"

                    if full_text:
                        return full_text
                return None

            err_text = ""
            try:
                err_json = resp.json()
                err_text = err_json.get("error", {}).get("message", "")
            except Exception:
                err_text = resp.text[:200]

            if resp.status_code == 429:
                raise RuntimeError(f"Gemini API rate limit or quota exceeded: {err_text}")
            elif resp.status_code in (401, 403):
                raise RuntimeError(f"Gemini API authentication failed (invalid/restricted key): {err_text}")
            elif resp.status_code == 404:
                raise RuntimeError(f"Gemini model '{model_name}' not found or deprecated: {err_text}")
            elif resp.status_code == 503:
                raise RuntimeError(f"Gemini API temporarily unavailable (capacity spike): {err_text}")
            else:
                raise RuntimeError(f"Gemini API error (HTTP {resp.status_code}): {err_text}")

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
    ) -> Optional[str]:
        # Build prioritized list of candidate models
        models_to_try = []
        if self._model:
            models_to_try.append(self._model)
        # Resilient fallback order across active Gemini models with independent quotas and capacity
        for fallback_candidate in [
            "gemini-3-flash-preview",
            "gemini-flash-lite-latest",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-flash-latest",
            "gemini-3.5-flash",
        ]:
            if fallback_candidate not in models_to_try:
                models_to_try.append(fallback_candidate)

        last_err = None
        for attempt_idx, candidate_model in enumerate(models_to_try):
            # Retry up to 2 times per candidate model on temporary 503 capacity spikes
            for retry in range(2):
                try:
                    result = await self._execute_request(candidate_model, messages, system_prompt)
                    if result:
                        self._active_model = candidate_model
                        if candidate_model != self._model:
                            logger.info("Gemini primary model '%s' unavailable; succeeded with fallback '%s'", self._model, candidate_model)
                        return result
                except Exception as exc:
                    last_err = exc
                    err_str = str(exc)
                    # If temporary 503 capacity spike, backoff and retry once
                    if "503" in err_str and retry == 0:
                        logger.info("Gemini model '%s' capacity spike (503); retrying after 1.5s...", candidate_model)
                        import asyncio
                        await asyncio.sleep(1.5)
                        continue
                    # For 429 quota exhaustion or persistent error, break to next candidate model
                    logger.warning(
                        "Gemini generation attempt with model '%s' failed: %s",
                        candidate_model,
                        exc,
                    )
                    break

        if last_err:
            raise last_err
        return None


def get_configured_ai_provider() -> Optional[BaseAIProvider]:
    provider = (settings.AI_PROVIDER or "none").strip().lower()

    # Check both AI_API_KEY and GEMINI_API_KEY
    import os
    api_key = (
        settings.AI_API_KEY
        or getattr(settings, "GEMINI_API_KEY", None)
        or os.environ.get("GEMINI_API_KEY")
        or ""
    ).strip()

    if provider in ("none", "", "disabled", "null"):
        if api_key:
            provider = "gemini"
        else:
            return None

    if not api_key:
        logger.info("AI provider configured as '%s' but API key is unset. Using deterministic fallback.", provider)
        return None

    if provider == "gemini":
        return GeminiProvider(
            api_key=api_key,
            model=settings.AI_MODEL or "gemini-3.5-flash-lite",
            base_url=settings.AI_BASE_URL,
            timeout=settings.AI_TIMEOUT_SECONDS,
        )
    elif provider in ("openai", "groq", "ollama", "deepseek", "custom"):
        default_base_url = None
        default_model = None
        if provider == "groq":
            default_base_url = "https://api.groq.com/openai/v1"
            default_model = "llama-3.3-70b-versatile"
        elif provider == "ollama":
            default_base_url = "http://localhost:11434/v1"
            default_model = "llama3"

        return OpenAICompatibleProvider(
            api_key=api_key,
            model=settings.AI_MODEL or default_model,
            base_url=settings.AI_BASE_URL or default_base_url,
            timeout=settings.AI_TIMEOUT_SECONDS,
            provider_label=provider,
        )

    logger.warning("Unknown AI provider '%s'. Using deterministic fallback.", provider)
    return None
