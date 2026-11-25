"""
Tests for AI Career Assistant Module
Covering context generation, chat workflows, persistent history, tenant isolation,
AI provider abstraction with fallback, deterministic career guidance, and validation.
"""
from typing import Tuple
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.resume import ResumeAnalysis
from app.models.readiness import CareerReadinessAssessment
from app.models.skill_gap import SkillGapAnalysis
from app.models.recommendation import CareerRecommendation
from app.models.job import SavedJob
from app.models.roadmap import LearningRoadmap
from app.models.ats import AtsEvaluation
from app.models.github import GitHubAnalysis
from app.models.report import Report
from app.models.career_assistant import CareerAssistantConversation, CareerAssistantMessage
from app.services.career_assistant_service import (
    build_student_context,
    generate_deterministic_career_guidance,
)
from app.services.ai_provider import BaseAIProvider


def _create_user_with_context(
    client: TestClient,
    db_session: Session,
    email: str = "assistant_tester@example.com",
    role: str = "Data Analyst",
    populate_all_modules: bool = False,
) -> Tuple[dict, User]:
    user = User(
        email=email,
        hashed_password=hash_password("Pass123!"),
        full_name="Assistant Tester",
        role="student",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        target_role=role,
        skills=[
            {"name": "Python", "level": 4},
            {"name": "SQL", "level": 3},
            {"name": "Pandas", "level": 4},
        ],
        education_level="B.Tech Computer Science",
        experience_months=12,
        github_url="https://github.com/assistanttester",
    )
    db_session.add(profile)
    db_session.commit()

    if populate_all_modules:
        # 1. Resume
        resume = ResumeAnalysis(
            user_id=user.id,
            filename="tester_resume.pdf",
            file_type="pdf",
            file_size_bytes=10240,
            skills=[
                {"name": "Python", "category": "Programming Languages"},
                {"name": "SQL", "category": "Databases"},
                {"name": "Tableau", "category": "BI & Analytics"},
            ],
            education={"degree": "B.Tech"},
            summary="Candidate with strong analytical foundation",
        )
        db_session.add(resume)

        # 2. Career Readiness
        readiness = CareerReadinessAssessment(
            user_id=user.id,
            target_role=role,
            readiness_score=85.5,
            readiness_category="High Readiness",
            model_version="rf_v1.0",
            dimension_scores={
                "technical_skills": 88.0,
                "problem_solving": 82.0,
                "project_experience": 84.0,
                "communication": 80.0,
            },
            features_snapshot={"core_coverage": 0.8},
            matching_core_skills=["Python", "SQL"],
            missing_core_skills=["AWS"],
            supporting_skills=["Tableau"],
        )
        db_session.add(readiness)

        # 3. Skill Gap
        skill_gap = SkillGapAnalysis(
            user_id=user.id,
            target_role=role,
            skill_coverage_percentage=75.0,
            proficiency_alignment_percentage=80.0,
            met_count=2,
            improvement_count=1,
            missing_count=2,
            total_required=5,
            skills_comparison=[
                {"skill": "Python", "status": "met"},
                {"skill": "SQL", "status": "met"},
                {"skill": "Power BI", "status": "needs_improvement"},
                {"skill": "AWS", "status": "missing"},
                {"skill": "Docker", "status": "missing"},
            ],
            recommendations=["Learn AWS and Docker for cloud deployments"],
        )
        db_session.add(skill_gap)

        # 4. Career Recommendations
        recom = CareerRecommendation(
            user_id=user.id,
            top_role="Data Analyst",
            top_fit_score=92.0,
            recommended_roles=[
                {"role": "Data Analyst", "fit_score": 92.0, "reasoning": "Strong SQL and Pandas foundations"},
                {"role": "Business Intelligence Analyst", "fit_score": 84.0, "reasoning": "Good analytical skills"},
            ],
            student_skills_snapshot=[{"name": "Python"}, {"name": "SQL"}],
        )
        db_session.add(recom)

        # 5. Saved Job
        job = SavedJob(
            user_id=user.id,
            job_id="job-da-01",
        )
        db_session.add(job)

        # 6. Learning Roadmap
        roadmap = LearningRoadmap(
            user_id=user.id,
            target_role=role,
            total_weeks=6,
            current_week=1,
            completion_percentage=33.3,
            total_items=3,
            completed_items=1,
            weeks_data=[
                {
                    "week_number": 1,
                    "title": "Advanced SQL & Relational Databases",
                    "estimated_hours": 10,
                    "topics": [
                        {"id": "t1", "title": "Window Functions", "is_completed": True},
                        {"id": "t2", "title": "Subqueries & CTEs", "is_completed": False},
                    ],
                    "resources": [
                        {"title": "PostgreSQL Official Docs", "url": "https://www.postgresql.org/docs/"}
                    ],
                }
            ],
        )
        db_session.add(roadmap)

        # 7. ATS Evaluation
        ats = AtsEvaluation(
            user_id=user.id,
            filename="tester_resume.pdf",
            target_role=role,
            overall_score=82.0,
            grade="Good Match",
            category_scores={
                "keyword_matching": 26.0,
                "section_completeness": 18.0,
                "experience_relevance": 17.0,
                "quantifiable_achievements": 11.0,
                "formatting_readability": 10.0,
            },
            matched_skills=["Python", "SQL", "Pandas"],
            missing_skills=["AWS", "Docker"],
            recommendations=["Add quantifiable metrics to project bullet points"],
        )
        db_session.add(ats)

        # 8. GitHub Analysis
        github = GitHubAnalysis(
            user_id=user.id,
            username="assistanttester",
            target_role=role,
            overall_score=78.0,
            grade="B+ (Strong Portfolio)",
            category_scores={
                "repo_quality": 80.0,
                "activity_consistency": 75.0,
                "tech_diversity": 82.0,
                "portfolio_depth": 75.0,
            },
            total_repos_analyzed=8,
            total_stars=12,
            languages={"Python": 70.0, "SQL": 30.0},
            detected_technologies=["Python", "SQL"],
            matched_skills=["Python", "SQL"],
            missing_skills=["Docker"],
            repositories=[
                {
                    "name": "sales-analytics-pipeline",
                    "description": "ETL pipeline using Python and Postgres",
                    "stars": 12,
                    "forks": 3,
                    "languages": ["Python", "SQL"],
                    "is_portfolio_worthy": True,
                }
            ],
            recommendations=["Add automated unit tests via GitHub Actions"],
        )
        db_session.add(github)

        # 9. Reports
        report = Report(
            user_id=user.id,
            target_role=role,
            title="Comprehensive Career Readiness Report",
            overall_readiness_score=85.5,
            file_path="/reports/report_test.pdf",
            file_size_bytes=45000,
        )
        db_session.add(report)

        db_session.commit()

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Pass123!"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, user


# Scenario 1: Test Context Generation with All Modules Populated
def test_context_generation_all_modules(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="all_modules@example.com", populate_all_modules=True
    )
    context = build_student_context(user.id, db_session)

    assert context["student_name"] == "Assistant Tester"
    assert context["target_role"] == "Data Analyst"
    assert context["available_modules_count"] >= 9
    assert context["profile"] is not None
    assert context["resume"] is not None
    assert context["readiness"] is not None
    assert context["readiness"]["readiness_score"] == 85.5
    assert context["skill_gap"] is not None
    assert context["recommendations"] is not None
    assert context["job_matches"] is not None
    assert context["roadmap"] is not None
    assert context["ats"] is not None
    assert context["github"] is not None
    assert context["report"] is not None


# Scenario 2: Test Context Generation with Missing Modules (Graceful Handling)
def test_context_generation_missing_modules(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="no_modules@example.com", populate_all_modules=False
    )
    context = build_student_context(user.id, db_session)

    assert context["student_name"] == "Assistant Tester"
    assert context["resume"] is None
    assert context["readiness"] is None
    assert context["skill_gap"] is None
    assert context["roadmap"] is None
    assert context["ats"] is None
    assert context["github"] is None
    assert context["report"] is None
    assert context["available_modules_count"] <= 2  # profile and optional live job matches


# Scenario 3: Test Chat Endpoint Starting a New Conversation
def test_chat_endpoint_new_conversation(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="chat_new@example.com", populate_all_modules=True
    )

    payload = {
        "message": "What are my main skill gaps for Data Analyst?",
        "target_role": "Data Analyst",
    }
    resp = client.post("/api/v1/career-assistant/chat", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert "conversation_id" in data
    assert data["assistant_response"] is not None
    assert len(data["assistant_response"]) > 10
    assert data["provider_used"] is not None

    # Verify conversation created in DB
    conv = db_session.query(CareerAssistantConversation).filter_by(id=data["conversation_id"]).first()
    assert conv is not None
    assert conv.user_id == user.id

    # Verify messages saved
    msgs = db_session.query(CareerAssistantMessage).filter_by(conversation_id=conv.id).all()
    assert len(msgs) == 2  # user and assistant


# Scenario 4: Test Chat Endpoint Continuing Existing Conversation
def test_chat_endpoint_existing_conversation(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="chat_cont@example.com", populate_all_modules=True
    )

    # First turn
    resp1 = client.post(
        "/api/v1/career-assistant/chat",
        json={"message": "Hello, how ready am I for this role?"},
        headers=headers,
    )
    assert resp1.status_code == 200
    conv_id = resp1.json()["conversation_id"]

    # Second turn
    resp2 = client.post(
        "/api/v1/career-assistant/chat",
        json={"conversation_id": conv_id, "message": "What should I do first?"},
        headers=headers,
    )
    assert resp2.status_code == 200
    assert resp2.json()["conversation_id"] == conv_id

    # Verify total 4 messages in conversation
    msgs = db_session.query(CareerAssistantMessage).filter_by(conversation_id=conv_id).all()
    assert len(msgs) == 4


# Scenario 5: Test Conversation History Retrieval
def test_conversation_history_retrieval(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="history@example.com", populate_all_modules=True
    )

    resp1 = client.post(
        "/api/v1/career-assistant/chat",
        json={"message": "Can you review my resume ATS score?"},
        headers=headers,
    )
    conv_id = resp1.json()["conversation_id"]

    resp = client.get(f"/api/v1/career-assistant/conversations/{conv_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["id"] == conv_id
    assert len(data["messages"]) == 2
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][1]["role"] == "assistant"


# Scenario 6: Test Conversation List Endpoint
def test_conversation_list_endpoint(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="conv_list@example.com", populate_all_modules=False
    )

    # Create two conversations
    client.post("/api/v1/career-assistant/chat", json={"message": "First query"}, headers=headers)
    client.post("/api/v1/career-assistant/chat", json={"message": "Second query"}, headers=headers)

    resp = client.get("/api/v1/career-assistant/conversations", headers=headers)
    assert resp.status_code == 200
    conversations = resp.json()
    assert len(conversations) == 2
    assert "message_count" in conversations[0]
    assert "last_message_preview" in conversations[0]


# Scenario 7: Test Conversation Deletion with Cascading Messages
def test_conversation_deletion(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="delete_conv@example.com", populate_all_modules=False
    )

    resp1 = client.post("/api/v1/career-assistant/chat", json={"message": "To be deleted"}, headers=headers)
    conv_id = resp1.json()["conversation_id"]

    del_resp = client.delete(f"/api/v1/career-assistant/conversations/{conv_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"

    # Subsequent retrieval returns 404
    get_resp = client.get(f"/api/v1/career-assistant/conversations/{conv_id}", headers=headers)
    assert get_resp.status_code == 404

    # Verify messages are cascaded in DB
    remaining_msgs = db_session.query(CareerAssistantMessage).filter_by(conversation_id=conv_id).all()
    assert len(remaining_msgs) == 0


# Scenario 8: Test Career Assistant Unauthorized Access
def test_career_assistant_unauthorized(client: TestClient, db_session: Session):
    assert client.get("/api/v1/career-assistant/context").status_code == 401
    assert client.get("/api/v1/career-assistant/conversations").status_code == 401
    assert client.post("/api/v1/career-assistant/chat", json={"message": "hello"}).status_code == 401
    assert client.delete("/api/v1/career-assistant/conversations/1").status_code == 401


# Scenario 9: Test Multi-User Tenant Isolation
def test_career_assistant_tenant_isolation(client: TestClient, db_session: Session):
    headers_a, user_a = _create_user_with_context(
        client, db_session, email="user_a@example.com", populate_all_modules=False
    )
    headers_b, user_b = _create_user_with_context(
        client, db_session, email="user_b@example.com", populate_all_modules=False
    )

    # User A creates a conversation
    resp_a = client.post("/api/v1/career-assistant/chat", json={"message": "User A secret plan"}, headers=headers_a)
    assert resp_a.status_code == 200
    conv_id_a = resp_a.json()["conversation_id"]

    # User B attempts to access User A's conversation -> 404
    resp_b_get = client.get(f"/api/v1/career-assistant/conversations/{conv_id_a}", headers=headers_b)
    assert resp_b_get.status_code == 404

    # User B attempts to chat into User A's conversation -> 404
    resp_b_chat = client.post(
        "/api/v1/career-assistant/chat",
        json={"conversation_id": conv_id_a, "message": "User B intrusion attempt"},
        headers=headers_b,
    )
    assert resp_b_chat.status_code == 404

    # User B attempts to delete User A's conversation -> 404
    resp_b_del = client.delete(f"/api/v1/career-assistant/conversations/{conv_id_a}", headers=headers_b)
    assert resp_b_del.status_code == 404

    # User A's conversation remains intact
    assert client.get(f"/api/v1/career-assistant/conversations/{conv_id_a}", headers=headers_a).status_code == 200


# Scenario 10: Test Conversation Not Found (404)
def test_conversation_not_found_404(client: TestClient, db_session: Session):
    headers, _ = _create_user_with_context(client, db_session, email="notfound@example.com")
    resp = client.get("/api/v1/career-assistant/conversations/99999", headers=headers)
    assert resp.status_code == 404


# Scenario 11: Test Empty Message Validation (422)
def test_empty_message_validation(client: TestClient, db_session: Session):
    headers, _ = _create_user_with_context(client, db_session, email="empty_msg@example.com")

    # Empty string
    resp1 = client.post("/api/v1/career-assistant/chat", json={"message": ""}, headers=headers)
    assert resp1.status_code == 422

    # Whitespace only
    resp2 = client.post("/api/v1/career-assistant/chat", json={"message": "     "}, headers=headers)
    assert resp2.status_code == 422


# Scenario 12: Test Oversized Message Validation (422)
def test_oversized_message_validation(client: TestClient, db_session: Session):
    headers, _ = _create_user_with_context(client, db_session, email="oversized@example.com")
    large_message = "A" * 2001

    resp = client.post("/api/v1/career-assistant/chat", json={"message": large_message}, headers=headers)
    assert resp.status_code == 422


# Scenario 13: Test AI Provider Mock Success Flow
class MockSuccessProvider(BaseAIProvider):
    @property
    def provider_name(self) -> str:
        return "mock-gpt"

    async def generate_response(self, messages: list, system_prompt: str) -> str:
        return "Based on your CareerTwin profile, focus on mastering SQL window functions and cloud deployment."


class MockAIProvider(BaseAIProvider):
    def __init__(self, response_text: str = "Success", provider_name_val: str = "mock-llm:v1"):
        self._response_text = response_text
        self._provider_name = provider_name_val

    @property
    def provider_name(self) -> str:
        return self._provider_name

    async def generate_response(self, messages: list, system_prompt: str) -> str:
        return self._response_text


def test_ai_provider_mock_success(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="ai_success@example.com", populate_all_modules=True
    )

    mock_provider = MockSuccessProvider()
    with patch(
        "app.services.career_assistant_service.get_configured_ai_provider",
        return_value=mock_provider,
    ):
        resp = client.post(
            "/api/v1/career-assistant/chat",
            json={"message": "What should I focus on next?"},
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()

        assert "SQL window functions" in data["assistant_response"]
        assert data["provider_used"] == "mock-gpt"


# Scenario 14: Test AI Provider Failure Graceful Fallback to Deterministic Advice
class MockFailingProvider(BaseAIProvider):
    @property
    def provider_name(self) -> str:
        return "failing-model"

    async def generate_response(self, messages: list, system_prompt: str) -> str:
        raise RuntimeError("Remote AI service connection timed out")


def test_ai_provider_failure_fallback(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="ai_failure@example.com", populate_all_modules=True
    )

    mock_provider = MockFailingProvider()
    with patch(
        "app.services.career_assistant_service.get_configured_ai_provider",
        return_value=mock_provider,
    ):
        resp = client.post(
            "/api/v1/career-assistant/chat",
            json={"message": "How is my ATS resume score?"},
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()

        # Should fall back gracefully to deterministic guidance
        assert "careertwin_deterministic" in data["provider_used"]
        assert data.get("is_fallback") is True
        assert "ATS" in data["assistant_response"]
        assert len(data["assistant_response"]) > 20


# Scenario 15: Test Deterministic Fallback Guidance Across Multiple Query Categories
def test_deterministic_fallback_guidance_categories(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="det_categories@example.com", populate_all_modules=True
    )
    context = build_student_context(user.id, db_session)

    # 1. Readiness query
    resp_readiness = generate_deterministic_career_guidance("How ready am I for this job role?", context)
    assert "85.5%" in resp_readiness or "High Readiness" in resp_readiness

    # 2. Skill gaps query
    resp_gaps = generate_deterministic_career_guidance("What are my top skill gaps?", context)
    assert "AWS" in resp_gaps or "Docker" in resp_gaps

    # 3. ATS score query
    resp_ats = generate_deterministic_career_guidance("How can I improve my resume ATS score?", context)
    assert "82/100" in resp_ats or "ATS" in resp_ats

    # 4. GitHub review query
    resp_github = generate_deterministic_career_guidance("Review my GitHub repository portfolio", context)
    assert "78/100" in resp_github or "assistanttester" in resp_github

    # 5. Roadmap query
    resp_roadmap = generate_deterministic_career_guidance("What is on my learning roadmap?", context)
    assert "Week 1" in resp_roadmap or "Roadmap" in resp_roadmap

    # 6. Role comparison query
    resp_compare = generate_deterministic_career_guidance("Compare Data Analyst vs Python Developer", context)
    assert "Comparison" in resp_compare or "Data Analyst" in resp_compare


# Scenario 16: Test Context Snapshot Endpoint
def test_context_snapshot_endpoint(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="snapshot@example.com", populate_all_modules=True
    )

    resp = client.get("/api/v1/career-assistant/context?target_role=Data Analyst", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["student_name"] == "Assistant Tester"
    assert data["target_role"] == "Data Analyst"
    assert data["available_modules_count"] >= 9
    assert "provider_status" in data
    assert data["readiness_score"] == 85.5
    assert data["ats_score"] == 82.0


# Scenario 17: Test Retry Assistant Message Endpoint
def test_retry_assistant_message_endpoint(client: TestClient, db_session: Session):
    headers, user = _create_user_with_context(
        client, db_session, email="retry_test@example.com", populate_all_modules=True
    )

    # 1. Send initial message with mock failing provider
    mock_failing = MockFailingProvider()
    with patch("app.services.career_assistant_service.get_configured_ai_provider", return_value=mock_failing):
        chat_resp = client.post(
            "/api/v1/career-assistant/chat",
            json={"message": "What is SQL?"},
            headers=headers,
        )
        assert chat_resp.status_code == 200
        conv_id = chat_resp.json()["conversation_id"]
        assert chat_resp.json()["is_fallback"] is True

    # 2. Retry with a succeeding mock provider
    mock_success = MockAIProvider(response_text="SQL is Structured Query Language for managing relational databases.")
    with patch("app.services.career_assistant_service.get_configured_ai_provider", return_value=mock_success):
        retry_resp = client.post(
            f"/api/v1/career-assistant/conversations/{conv_id}/retry",
            headers=headers,
        )
        assert retry_resp.status_code == 200
        data = retry_resp.json()
        assert data["is_fallback"] is False
        assert "Structured Query Language" in data["assistant_response"]
        assert data["provider_used"] == "mock-llm:v1"
        assert data["relevant_context"]["github_score"] == 78.0
