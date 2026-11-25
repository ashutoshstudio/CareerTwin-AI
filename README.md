# CareerTwin AI 🚀

### Explainable Machine Learning-Based Career Readiness, Skill Gap Analysis & Job Matching Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4%2B-F7931E.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic-green.svg)](#license)

---

## 📌 Problem Statement

Graduating students and early-career job seekers often struggle to answer critical questions:
- *Am I truly ready for an entry-level software engineering, data science, or cloud role?*
- *What specific technical competencies am I missing compared to real market expectations?*
- *Why did an automated hiring system or ATS filter reject my resume?*
- *What actionable roadmap should I follow this week to become job-ready?*

Most existing platforms either offer generic career advice or function as black-box assessment systems that assign arbitrary scores without explanation. 

**CareerTwin AI** bridges this gap by acting as a personalized **Digital Career Twin**. It models a candidate's complete technical profile, evaluates career readiness using trained machine learning models, benchmarks competencies against a comprehensive **42+ job profile catalog**, provides transparent explanations via **Explainable AI (SHAP & LIME)**, and connects users to real job opportunities through multi-provider external job integrations.

---

## 🏛️ System Architecture

```
                                  ┌───────────────────────────────┐
                                  │      React 19 + Vite UI       │
                                  │   (Nordic Emerald Design)     │
                                  └───────────────┬───────────────┘
                                                  │ REST APIs & JWT
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │      FastAPI REST Server      │
                                  │ (Auth, CORS, Pydantic V2)     │
                                  └───────┬───────────────┬───────┘
                                          │               │
                 ┌────────────────────────┴───────┐       └──────────────────────────────┐
                 ▼                                ▼                                      ▼
    ┌─────────────────────────┐      ┌─────────────────────────┐            ┌─────────────────────────┐
    │   Machine Learning Core │      │   External Providers    │            │    Relational Store     │
    │  - Scikit-Learn Models  │      │  - Adzuna Job API       │            │  - SQLite (careertwin)  │
    │  - SHAP / LIME Engine   │      │  - Remotive / Arbeitnow │            │  - SQLAlchemy 2.0 ORM   │
    │  - Heuristic ATS Parser │      │  - Google OAuth 2.0     │            │  - Message & Chat Store │
    │  - 42-Role Catalog      │      │  - Multi-Model LLM API  │            │  - Profile & Roadmaps   │
    └─────────────────────────┘      └─────────────────────────┘            └─────────────────────────┘
```

---

## 🌟 The 13 Core Modules

CareerTwin AI delivers an integrated suite of 13 dedicated modules designed to take a candidate from raw student status to interview-ready:

### 1. 🔐 Authentication & Identity Management
- Secure password hashing using `bcrypt` with salt rounds.
- Stateless, signed JSON Web Tokens (JWT) using `HS256`.
- Integrated **Google OAuth 2.0 Authorization Code flow** with automatic account linking and profile creation.
- Strict route guarding and tenant data isolation.

### 2. 👤 Student Profile Management
- Comprehensive profile modeling: degree, institution, graduation year, experience, skills, GitHub URL, and LinkedIn URL.
- Dynamic target career role selection against our 42-role catalog.
- Profile completeness tracking with actionable completion checklists.

### 3. 📄 Resume Analyzer & Parser
- Dual-format document extraction for `.pdf` and `.docx` resumes.
- Regex boundary skill parsing mapped against a curated taxonomy of 250+ technical skills.
- Automatic extraction of education qualifications, graduation year, contact details, and summary.

### 4. 📈 Career Readiness Assessment (Machine Learning)
- Trained Scikit-Learn ensemble model predicting overall career readiness percentage (0–100%).
- Multi-dimensional scoring across 4 pillars: Technical Competency, Practical Experience, Education Level, and Portfolio Depth.
- Tier categorization: *High Readiness*, *Moderate Readiness*, and *Needs Development*.

### 5. 🎯 Skill Gap Analysis
- Role-specific competency comparison evaluating coverage percentage and alignment score.
- Categorization into **Matching Core Skills**, **Missing Core Competencies**, and **Supporting Skills**.
- Prioritized action items pinpointing high-impact skills to acquire next.

### 6. 🧭 Career Recommendations (42+ Roles Catalog)
- Expansive catalog covering **42 distinct entry and early-career profiles** across 6 industry tracks:
  - *Software Engineering* (Python, Java, Full Stack, Frontend, Backend, Android, Flutter)
  - *AI & Data Science* (Data Analyst, Data Scientist, ML Engineer, AI Engineer, GenAI Dev, NLP, Computer Vision)
  - *Cloud & DevOps* (Cloud Engineer, AWS, Azure, DevOps, Site Reliability, Kubernetes)
  - *Cybersecurity* (Security Analyst, Penetration Tester, SOC Analyst, Network Security)
  - *Quality Assurance & Systems* (QA Engineer, SDET, Linux Admin, Systems Engineer)
  - *Data & Business Intelligence* (BI Analyst, Big Data Engineer, Data Architect, Database Admin)
- Multi-factor recommendation algorithm scoring profile alignment and difficulty of transition.

### 7. 📑 ATS Resume Scorer
- Transparent 100-point heuristic ATS scoring algorithm evaluated across 5 key dimensions:
  1. *Keyword & Skill Matching (30 pts)*
  2. *Section Completeness (20 pts)*
  3. *Experience Relevance (20 pts)*
  4. *Quantifiable Achievements & Metrics (15 pts)*
  5. *Formatting & Readability (15 pts)*
- Actionable **Before vs. After** bullet point rewriting suggestions and multi-role compatibility testing.

### 8. 🐙 GitHub Portfolio Analyzer
- Public repository inspection via official GitHub REST API (no mandatory personal tokens required).
- 100-point portfolio scoring assessing repository activity, language diversity, documentation quality, and project depth.
- Automatic technology stack categorization into frontend, backend, database, and devops tools.
- **1-Click Skill Sync**: Seamlessly synchronize detected GitHub technologies into the student's verified profile.

### 9. 🗺️ Learning Roadmap Generator
- Dynamic weekly milestone engine that transforms identified skill gaps into an actionable curriculum.
- Granular weekly topic checklists, time commitments, and milestone verification.
- Curated, verified free learning resources (official documentation, courses, and tutorials).

### 10. 🎙️ Mock Interview Simulator
- Role-specific technical and behavioral mock interview sessions benchmarked against target career profiles.
- Configurable difficulty levels (Junior, Mid-Level) and question types (Coding, System Design, Behavioral).
- Instant scoring, answer evaluation, rubric breakdowns, and model response explanations.

### 11. 💼 Live Job Matches & External Provider Hub
- Modular multi-provider job search architecture integrating:
  - **Adzuna API** (Official developer integration with country and keyword targeting)
  - **Remotive API** (Curated remote engineering roles)
  - **Arbeitnow API** (Tech and software roles)
- Semantic skill matching calculating candidate match percentage against live job descriptions.
- In-memory caching layer (`JOB_CACHE_TTL_MINUTES`) to respect free-tier provider rate limits.
- Save & Track functionality allowing candidates to monitor applications directly from their dashboard.

### 12. 🔍 Explainable AI (XAI with SHAP & LIME)
- Transparent model introspection removing black-box uncertainty.
- **SHAP (SHapley Additive exPlanations)**: Global feature importance charts displaying which skills and background factors most heavily influenced predictions.
- **LIME (Local Interpretable Model-agnostic Explanations)**: Local perturbations showing how specific skills elevated or reduced an individual candidate's readiness score.

### 13. 🤖 AI Career Assistant
- Conversational career advisory grounded directly in the student's real assessment history across all 11 modules.
- Multi-model LLM integration supporting Google Gemini (`gemini-3-flash-preview`), OpenAI (`gpt-4o-mini`), Groq (`llama-3.3-70b-versatile`), and local Ollama.
- **Thinking Token Budget Management**: Output limits configured to 3,500 tokens to ensure reasoning tokens do not clip long responses.
- Resilient fallback chain with automatic handover to a **deterministic rules-based curriculum engine** if external APIs are unavailable or exhausted.

---

## 💻 Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Vite 6 | Fast modern SPA with route-based code-splitting |
| **Styling** | Tailwind CSS 4, Lucide React | Nordic Emerald frosted glass design language |
| **Charts** | Recharts, Framer Motion | Smooth, reactive data visualizations and animations |
| **Backend** | FastAPI, Uvicorn, Python 3.11+ | High-performance asynchronous REST API |
| **Data Validation** | Pydantic V2, Pydantic-Settings | Strict schema validation and environment management |
| **ORM & Database** | SQLAlchemy 2.0, SQLite | Type-safe persistence with multi-tenant user isolation |
| **Machine Learning** | Scikit-Learn, NumPy, Pandas | Ensemble models for readiness scoring and categorization |
| **Explainability** | SHAP, LIME | Model interpretability and feature attribution |
| **Testing** | Pytest, ESLint | Automated test suites and strict code style checks |

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18.0 or higher
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ashutoshstudio/CareerTwin-AI.git
cd CareerTwin-AI
```

### 2. Backend Setup
```bash
cd backend

# Create and activate a Python virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create local environment file from example template
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS
```

Edit `backend/.env` with your preferred settings:
```ini
SECRET_KEY=your-secure-random-secret-key
DATABASE_URL=sqlite:///./data/careertwin.db

# Optional AI Career Assistant (defaults to deterministic fallback if unset)
AI_PROVIDER=none         # Change to 'gemini' if using Google AI Studio
GEMINI_API_KEY=your-gemini-api-key-here
AI_MODEL=gemini-3-flash-preview
AI_MAX_TOKENS=3500

# Optional Google OAuth 2.0 (leave blank to use standard email/password)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

---

## 🏃 Running the Application

### Start the Backend Server
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Server: `http://127.0.0.1:8000`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`
- Redoc Alternative Documentation: `http://127.0.0.1:8000/redoc`

### Start the Frontend Client
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Verification & Testing

### Run Backend Test Suite
```bash
cd backend
.\venv\Scripts\pytest -v
```
*Executes comprehensive tests across authentication, readiness models, career assistant, ATS scorer, GitHub analyzer, mock interviews, and job matching.*

### Run Frontend Linter & Production Build
```bash
cd frontend
npm run lint
npm run build
```

---

## 🛡️ Security & Privacy Principles

1. **No Hardcoded Secrets**: All API keys, OAuth client secrets, and database credentials reside strictly in uncommitted `.env` files.
2. **Safe Fallbacks**: If external API credentials (Gemini, Adzuna, GitHub) are not configured, all modules gracefully engage deterministic fallback engines without throwing runtime errors or falsely claiming AI generation.
3. **Tenant Isolation**: All queries enforce strict user ID ownership checks, ensuring students can only access their own assessments, resumes, and interview records.
4. **Localhost Execution**: Designed for secure, privacy-preserving execution on local environments.

---

## ⚠️ Limitations & Academic Context

- **Academic Scope**: CareerTwin AI was designed as a final-year Bachelor of Computer Applications (BCA) capstone project showcasing applied Data Science, Machine Learning, and Full-Stack Engineering.
- **External API Quotas**: Live job matching and LLM advisory rely on external free-tier quotas (Adzuna, Gemini). During peak provider demand, modules fall back to built-in curriculum rules.
- **Single-Host Database**: The default database is SQLite for easy evaluation. For enterprise production scale, configure `DATABASE_URL` with a PostgreSQL connection string.

---

## 📄 License

This project is created and maintained for academic and educational evaluation.
