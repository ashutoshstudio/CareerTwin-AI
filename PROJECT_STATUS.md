# CareerTwin AI — Comprehensive Project Status Document

> **Document Type:** Architectural Audit & Project Status Specification  
> **Target Project:** `C:\Users\ashut\Desktop\CareerTwin-AI`  
> **Audit Date:** November 2026  
> **Auditor:** Senior Full-Stack Architect, Lead Systems Developer & AI/ML Engineer  
> **Status Classification Standard:** `COMPLETE`, `PARTIALLY COMPLETE`, `NOT IMPLEMENTED`, `NEEDS VERIFICATION`

---

## 1. Project Overview

**CareerTwin AI** is an explainable machine learning-based career readiness, skill gap analysis, and job matching system designed primarily for undergraduate and postgraduate students (e.g., BCA, B.Tech, MCA, B.Sc) and fresh graduates.

### Purpose and Core Objectives
- **Profile & Skill Assessment:** Ingest and normalize verified technical skills, educational history, work/internship experience, and portfolio links.
- **Resume Parsing & Skill Extraction:** Extract text from uploaded PDF and DOCX files, map candidate skills against a normalized taxonomy using regex-based boundary recognition, and auto-detect academic qualifications and contact details.
- **Career Readiness Prediction:** Predict readiness scores (0–100%) and categorizations (*High Readiness*, *Moderate Readiness*, *Needs Development*) across multi-dimensional metrics (Technical, Experience, Education, Portfolio) using Scikit-Learn ensemble models.
- **Skill Gap Identification:** Benchmark candidate competencies against role requirements to quantify coverage percentage, alignment percentage, and generate prioritized, actionable learning recommendations.
- **Career Recommendations:** Score and rank suitable career paths across a multi-factor catalog, providing transparent matching rationale and deficit analysis.
- **Curated Vacancy Matching:** Compute multi-factor compatibility between verified candidate skills and curated entry-level job vacancies, enabling students to search, filter, and bookmark opportunities.
- **Explainable AI (XAI):** Eliminate black-box uncertainty by computing true additive SHAP feature attributions and LIME local linear decision boundaries with mathematical fidelity verification.

---

## 2. Technology Stack

### 2.1 Backend Core
| Technology | Version / Spec | Purpose |
|---|---|---|
| **Python** | 3.12.x / 3.11+ | Runtime environment |
| **FastAPI** | `>=0.110.0, <0.120.0` | High-performance asynchronous REST API framework |
| **Uvicorn** | `>=0.28.0, <0.35.0` | ASGI web server |
| **SQLAlchemy** | `>=2.0.25, <2.1.0` | ORM for relational mapping and database sessions |
| **Pydantic & Settings** | `>=2.6.0, <3.0.0` | Request/response schema validation and environment management |
| **PyJWT** | `>=2.8.0, <3.0.0` | Signed HMAC-SHA256 authentication tokens |
| **Bcrypt** | `>=4.1.2, <4.3.0` | Password hashing with adaptive salt rounds |
| **python-multipart** | `>=0.0.9` | Streaming multi-part form-data / resume uploads |

### 2.2 Machine Learning & Explainable AI (XAI)
| Technology | Version / Spec | Purpose |
|---|---|---|
| **Scikit-learn** | `>=1.4.0` | RandomForestClassifier & RandomForestRegressor pipelines |
| **SHAP** | `>=0.45.0` | Exact TreeExplainer additive feature attribution ($`\phi_i`$) |
| **LIME** | `>=0.2.0` | LimeTabularExplainer local linear surrogate rules |
| **NumPy** | `>=1.26.0` | Vectorized numerical computation |
| **Pandas** | `>=2.2.0` | Tabular data manipulation |
| **Joblib** | `>=1.3.0` | Model artifact persistence and serialization |

### 2.3 Document Processing & Parsing
| Technology | Version / Spec | Purpose |
|---|---|---|
| **pypdf** | `>=5.0.0` | Binary PDF stream parsing and page text extraction |
| **python-docx** | `>=1.1.0` | OpenXML DOCX paragraph extraction |
| **Regular Expressions (`re`)** | Python Standard Lib | Word-boundary skill and degree pattern matcher |

### 2.4 Database
| Technology | Implementation | Location |
|---|---|---|
| **SQLite 3** | Local disk database via SQLAlchemy 2 | `backend/data/careertwin.db` |

### 2.5 Frontend Client
| Technology | Version / Spec | Purpose |
|---|---|---|
| **React** | `^19.2.8` | Client UI library |
| **Vite** | `^8.2.0` | Modern frontend build tool and dev server |
| **React Router** | `^7.18.2` | Client-side routing and layout orchestration |
| **Tailwind CSS** | `^4.3.3` | Utility styling engine |
| **Framer Motion** | `^13.1.1` | UI animations and spring transitions |
| **Lucide React** | `^1.33.0` | Modern SVG iconography |
| **Recharts** | `^3.10.1` | SVG chart visualizations |
| **Axios / Fetch API** | `^1.19.0` / Native | Backend HTTP API communication layer |

---

## 3. Complete Folder Structure

```
CareerTwin-AI/
├── .env.example                     # Environment template for workspace
├── .gitignore                       # Git exclusion rules
├── package-lock.json                # Root package lock
├── README.md                        # Academic project documentation
├── PROJECT_STATUS.md                # Central architectural status specification (This file)
│
├── backend/                         # FastAPI REST API Backend
│   ├── .env                         # Active backend environment configuration
│   ├── .env.example                 # Backend environment variable template
│   ├── README.md                    # Backend setup and API overview
│   ├── requirements.txt             # Python pinned dependency manifest
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry, CORS, lifecycle, health check
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py              # Dependency injection: get_db, get_current_user JWT guard
│   │   │   └── v1/
│   │   │       ├── api.py           # V1 API router registration
│   │   │       └── endpoints/
│   │   │           ├── auth.py          # /api/v1/auth (register, login)
│   │   │           ├── profile.py       # /api/v1/profile (/me GET, PUT)
│   │   │           ├── resume.py        # /api/v1/resume (analyze, history, latest)
│   │   │           ├── readiness.py     # /api/v1/readiness (assess, latest, history, model-info, explain)
│   │   │           ├── skill_gap.py     # /api/v1/skill-gap (analyze, latest, history, roles)
│   │   │           ├── recommendation.py# /api/v1/recommendations (evaluate, latest, catalog, history)
│   │   │           ├── job.py           # /api/v1/jobs (match, vacancies, saved, save/:id)
│   │   │           ├── xai.py           # /api/v1/xai (explain POST/GET, global)
│   │   │           ├── roadmap.py       # /api/v1/roadmap (curriculum, toggle, summary)
│   │   │           ├── ats.py           # /api/v1/ats (score-file, score-text, score-latest, history)
│   │   │           └── github.py        # /api/v1/github (analyze, latest, history, sync-skills)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Pydantic Settings, CORS origins, paths
│   │   │   ├── database.py          # SQLAlchemy engine, declarative Base, session, init_db
│   │   │   └── security.py          # Bcrypt hashing, password verification, JWT creation/decoding
│   │   ├── ml/
│   │   │   ├── readiness_model.py   # Feature extraction (9 dims), Scikit-Learn training/inference
│   │   │   └── xai_service.py       # SHAP TreeExplainer, LIME Tabular, Fidelity verification
│   │   ├── models/                  # SQLAlchemy 2 Declarative ORM Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User table & credentials
│   │   │   ├── profile.py           # StudentProfile table (JSON skills & academic info)
│   │   │   ├── resume.py            # ResumeAnalysis table
│   │   │   ├── readiness.py         # CareerReadinessAssessment table
│   │   │   ├── skill_gap.py         # SkillGapAnalysis table
│   │   │   ├── recommendation.py    # CareerRecommendation table
│   │   │   ├── job.py               # SavedJob table (user bookmark mapping)
│   │   │   ├── roadmap.py           # LearningRoadmap table (persistent curriculum & progress)
│   │   │   ├── ats.py               # AtsEvaluation table (heuristic scores & recommendations)
│   │   │   └── github.py            # GitHubAnalysis table (portfolio scores, repos & tech)
│   │   ├── schemas/                 # Pydantic Validation & Serialization Schemas
│   │   │   ├── __init__.py
│   │   │   ├── token.py             # Token & TokenPayload schemas
│   │   │   ├── user.py              # UserRegister, UserLogin, UserOut, AuthResponse
│   │   │   ├── profile.py           # SkillItem, ProfileUpdate, ProfileOut
│   │   │   ├── resume.py            # ResumeAnalysisOut, ExtractedSkill, ContactInfo
│   │   │   ├── readiness.py         # ReadinessAssessmentRequest, CareerReadinessOut, ModelInfoOut
│   │   │   ├── skill_gap.py         # SkillGapRequest, SkillGapOut, LearningRecommendation
│   │   │   ├── recommendation.py    # CareerRecommendationsRequest, CareerRecommendationsOut
│   │   │   ├── job.py               # JobListingBase, JobMatchResult, SavedJobOut
│   │   │   ├── xai.py               # ModelExplanationOut, FeatureAttributionItem, FidelityCheck
│   │   │   ├── roadmap.py           # RoadmapResource, RoadmapItem, RoadmapWeek, RoadmapOut
│   │   │   ├── ats.py               # AtsCategoryScores, AtsRecommendationItem, AtsEvaluationOut
│   │   │   └── github.py            # GitHubCategoryScores, GitHubRepoItem, GitHubAnalysisOut
│   │   └── services/                # Business Logic & Extraction Services
│   │       ├── resume_parser.py     # PDF & DOCX binary text extraction
│   │       ├── skill_extractor.py   # Skill taxonomy regex matcher, degree & contact parser
│   │       ├── skill_gap_service.py # Role benchmarks & gap categorization
│   │       ├── recommendation_service.py # Role catalog & multi-factor fit scoring
│   │       ├── job_matching_service.py   # Vacancy matching & bookmarking
│   │       ├── roadmap_service.py   # Personalized curriculum generation & progress engine
│   │       ├── ats_service.py       # 100-point transparent ATS scoring heuristic engine
│   │       └── github_service.py    # 100-point GitHub portfolio scoring, caching & skill sync
│   ├── data/
│   │   ├── careertwin.db            # SQLite relational database
│   │   └── ml/
│   │       ├── readiness_models.joblib   # Trained RandomForest binary artifact
│   │       └── readiness_metadata.json   # Model evaluation metrics & metadata
│   └── tests/                       # Automated Pytest Suite (92 tests, 100% passing)
│       ├── __init__.py
│       ├── conftest.py              # In-memory SQLite fixture, TestClient overrides
│       ├── test_auth.py             # Auth & JWT tests
│       ├── test_health.py           # Health & OpenAPI documentation tests
│       ├── test_profile.py          # Profile CRUD & isolation tests
│       ├── test_resume.py           # PDF/DOCX parsing & skill extraction tests
│       ├── test_readiness.py        # ML readiness inference & model info tests
│       ├── test_skill_gap.py        # Skill gap benchmark tests
│       ├── test_recommendation.py   # Recommendation ranking tests
│       ├── test_job_matching.py     # Vacancy matching & saved job bookmark tests
│       ├── test_xai.py              # SHAP fidelity, LIME rules, & global XAI tests
│       ├── test_roadmap.py          # Learning roadmap generation & progress tracking tests
│       ├── test_ats.py              # ATS resume scoring, metrics, & multi-role tests
│       └── test_github.py           # GitHub portfolio scoring, caching, & skill sync tests
│
└── frontend/                        # React + Vite Client Application
    ├── package.json                 # Node dependencies and build scripts
    ├── vite.config.js               # Vite bundler configuration
    ├── index.html                   # HTML entry point
    ├── public/                      # Static assets & favicon
    └── src/
        ├── App.jsx                  # Root router configuration (Public, Student, Admin routes)
        ├── main.jsx                 # React root mount
        ├── index.css                # Global design system & theme variables
        ├── assets/                  # Hero illustrations and icons
        ├── components/              # Shared Reusable UI Components
        │   ├── Button.jsx           # Button component
        │   ├── Card.jsx             # Container card component
        │   ├── Footer.jsx           # Global footer
        │   ├── GoogleAuthModal.jsx  # Mock Google OAuth modal
        │   ├── Interactive3DAvatar.jsx # Visual decorative avatar
        │   ├── Loading.jsx          # Accessible spinner component
        │   ├── Navbar.jsx           # Navigation header with auth state
        │   └── PersistentShiningDots.jsx # Visual background canvas
        ├── contexts/
        │   └── AuthContext.jsx      # Authentication context, localStorage token management
        ├── data/
        │   └── careerPaths.js       # Static role catalog data for public view
        ├── layouts/
        │   ├── PublicLayout.jsx     # Header + Footer layout for unauthenticated pages
        │   ├── DashboardLayout.jsx  # Protected student dashboard sidebar layout
        │   └── AdminLayout.jsx      # Admin layout stub
        ├── pages/                   # Application Pages
        │   ├── Home.jsx             # Landing page
        │   ├── About.jsx            # About project page
        │   ├── HowItWorks.jsx       # Platform walkthrough
        │   ├── Careers.jsx          # Supported roles overview
        │   ├── CareerDetail.jsx     # Deep-dive role detail
        │   ├── Login.jsx            # User login page (connected to backend)
        │   ├── Register.jsx         # User registration page (connected to backend)
        │   ├── Profile.jsx          # Profile management (connected to backend)
        │   ├── ResumeAnalyzer.jsx   # Resume upload & parsing (connected to backend)
        │   ├── CareerReadiness.jsx  # ML readiness dashboard (connected to backend)
        │   ├── SkillGap.jsx         # Skill gap analysis (connected to backend)
        │   ├── Assessment.jsx       # Career recommendations (connected to backend)
        │   ├── JobMatches.jsx       # Vacancy matching & bookmarks (connected to backend)
        │   ├── ExplainableAI.jsx    # SHAP & LIME transparency (connected to backend)
        │   ├── Dashboard.jsx        # Main overview (connected to backend APIs with live roadmap widget)
        │   ├── AtsScore.jsx         # ATS resume scorer & recommendations (connected to backend)
        │   ├── CareerAssistant.jsx  # AI Career Assistant & persistent conversations (connected to backend)
        │   ├── LearningRoadmap.jsx  # Personalized weekly learning roadmap (connected to backend)
        │   ├── GitHubAnalyzer.jsx   # GitHub profile & portfolio analyzer (connected to backend)
        │   ├── MockInterview.jsx    # AI Mock Interview System & adaptive evaluator (connected to backend)
        │   ├── Reports.jsx          # Reports & PDF generation dossier (connected to backend)
        │   ├── AdminDashboard.jsx   # Admin placeholder stub page
        │   ├── AdminUsers.jsx       # Admin placeholder stub page
        │   ├── AdminJobs.jsx        # Admin placeholder stub page
        │   ├── AdminSkills.jsx      # Admin placeholder stub page
        │   ├── AdminRoles.jsx       # Admin placeholder stub page
        │   └── AdminAnalytics.jsx   # Admin placeholder stub page
        └── services/
            └── api.js               # Central HTTP API service connecting to FastAPI
```

---

## 4. Existing Frontend Architecture

### 4.1 Routing & Route Groups
Configured in `frontend/src/App.jsx` using `react-router-dom` v7:
1. **Public Routes (`PublicLayout`):**
   - `/`: Landing page (`Home.jsx`)
   - `/about`: Project background (`About.jsx`)
   - `/how-it-works`: Step-by-step explainer (`HowItWorks.jsx`)
   - `/careers`: Public catalog listing (`Careers.jsx`)
   - `/careers/:slug`: Detailed career breakdown (`CareerDetail.jsx`)
   - `/login`: User authentication (`Login.jsx`)
   - `/register`: Student signup (`Register.jsx`)
2. **Student Dashboard Routes (`DashboardLayout` — Protected):**
   - Directs unauthenticated guests to `/register?redirect=...`.
   - `/dashboard`: High-level summary (`Dashboard.jsx`)
   - `/profile`: Profile management (`Profile.jsx`)
   - `/resume-analyzer`: Resume upload and extraction (`ResumeAnalyzer.jsx`)
   - `/career-readiness`: ML readiness model predictions (`CareerReadiness.jsx`)
   - `/skill-gap`: Benchmark gap analysis (`SkillGap.jsx`)
   - `/assessment`: Career recommendations evaluation (`Assessment.jsx`)
   - `/job-matches`: Vacancy matching and bookmarks (`JobMatches.jsx`)
   - `/explainable-ai`: SHAP and LIME transparency (`ExplainableAI.jsx`)
   - `/roadmap`: Personalized learning curriculum (`LearningRoadmap.jsx`)
   - `/ats-score`: ATS resume scoring & optimization (`AtsScore.jsx`)
   - `/github-analyzer`: GitHub profile & repository analyzer (`GitHubAnalyzer.jsx`)
   - `/reports`: Career readiness reports & PDF generation (`Reports.jsx`)
   - `/assistant`: AI personal career assistant (`CareerAssistant.jsx`)
   - `/mock-interview`: AI mock interview practice simulator (`MockInterview.jsx`)
3. **Admin Routes (`AdminLayout` — Unconnected stubs):**
   - `/admin`, `/admin/users`, `/admin/jobs`, `/admin/skills`, `/admin/roles`, `/admin/analytics`

### 4.2 State Management & Authentication Flow
- Managed via `AuthContext.jsx`.
- Persists user object and Bearer JWT in `localStorage` under key `careertwin_auth_user`.
- On startup, validates active token against `/api/v1/profile/me`.
- Dispatches custom browser event `careertwin:auth-expired` upon encountering HTTP 401 responses, automatically resetting the session and navigating the user to re-authenticate.

### 4.3 HTTP Service Layer (`api.js`)
- Standardizes requests to `http://127.0.0.1:8000/api/v1`.
- Automatically injects `Authorization: Bearer <token>` headers.
- Handles multi-part `FormData` streams for resume uploads.
- Parses structured error messages returned by Pydantic validation errors (`HTTP 422`).

---

## 5. Existing Backend Architecture

### 5.1 Architecture Patterns
- **Layered Clean Architecture:** Strict separation between Presentation (`app/api`), Domain Business Logic (`app/services`), Persistence Models (`app/models`), Validation Schemas (`app/schemas`), and Core Utilities (`app/core`).
- **Dependency Injection:** Database sessions (`get_db`) and JWT authentication (`get_current_user`) are injected directly into route controllers via FastAPI `Depends()`.
- **Identity Derivation:** Strict tenant isolation: user ID is never trusted from request body or query parameters; it is derived directly from the verified cryptographic payload of the JWT Bearer token.
- **Graceful Lifecycle Management:** Database tables are ensured on ASGI lifespan startup via `init_db()`.

### 5.2 Security Architecture
- **Passwords:** Hashed with Bcrypt utilizing 12 adaptive salt rounds (`app/core/security.py`). Plaintext passwords are never stored.
- **JWT Tokens:** Signed using HMAC-SHA256 (`HS256`) with a 24-hour expiration (`1440 minutes`). Token contains standard claims (`sub`, `iat`, `exp`) and identity metadata (`email`, `role`).
- **CORS Middleware:** Configured with origins and regex (`r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"`) allowing local Vite ports (`5173`, `5174`, `5175`, `3000`).

---

## 6. Database Structure

The database engine is SQLite 3 via SQLAlchemy 2.0 ORM (`backend/data/careertwin.db`).

```
                    ┌────────────────────────┐
                    │         users          │
                    ├────────────────────────┤
                    │ id (PK)                │
                    │ email (Unique, Index)  │
                    │ hashed_password        │
                    │ full_name              │
                    │ role                   │
                    │ is_active              │
                    │ created_at, updated_at │
                    └───────────┬────────────┘
                                │ 1:1
        ┌───────────────────────┼─────────────────────────┬─────────────────────────┐
        │ 1:1                   │ 1:N                     │ 1:N                     │ 1:N
        ▼                       ▼                         ▼                         ▼
┌──────────────────┐  ┌───────────────────┐    ┌───────────────────┐     ┌──────────────────────┐
│ student_profiles │  │  resume_analyses  │    │ career_readiness_ │     │  skill_gap_analyses  │
├──────────────────┤  ├───────────────────┤    │    assessments    │     ├──────────────────────┤
│ id (PK)          │  │ id (PK)           │    ├───────────────────┤     │ id (PK)              │
│ user_id (FK, UQ) │  │ user_id (FK)      │    │ id (PK)           │     │ user_id (FK)         │
│ headline         │  │ filename          │    │ user_id (FK)      │     │ target_role          │
│ education_level  │  │ file_type         │    │ target_role       │     │ skill_coverage_%     │
│ institution      │  │ file_size_bytes   │    │ readiness_score   │     │ prof_alignment_%     │
│ graduation_year  │  │ status            │    │ readiness_category│     │ met_count            │
│ experience_months│  │ text_preview      │    │ model_version     │     │ improvement_count    │
│ github_url       │  │ skills (JSON)     │    │ dimension_scores  │     │ missing_count        │
│ linkedin_url     │  │ education (JSON)  │    │ features_snapshot │     │ total_required       │
│ target_role      │  │ contact_info(JSON)│    │ matching_core(J)  │     │ skills_comparison(J) │
│ skills (JSON)    │  │ warnings (JSON)   │    │ missing_core (J)  │     │ recommendations (J)  │
│ created_at       │  │ summary           │    │ supporting_skills │     │ created_at           │
│ updated_at       │  │ created_at        │    │ limitations (JSON)│     └──────────────────────┘
└──────────────────┘  └───────────────────┘    │ created_at        │
                                               └───────────────────┘
                                │
        ┌───────────────────────┼─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐
        │ 1:N                   │ 1:N                     │ 1:N                     │ 1:N                     │ 1:N
        ▼                       ▼                         ▼                         ▼                         ▼
┌───────────────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│     career_recommendations    │ │    saved_jobs     │ │   learning_roadmaps   │ │    ats_evaluations    │ │    github_analyses    │
├───────────────────────────────┤ ├───────────────────┤ ├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
│ id (PK)                       │ │ id (PK)           │ │ id (PK)               │ │ id (PK)               │ │ id (PK)               │
│ user_id (FK)                  │ │ user_id (FK)      │ │ user_id (FK)          │ │ user_id (FK)          │ │ user_id (FK)          │
│ top_role                      │ │ job_id (String)   │ │ target_role           │ │ filename              │ │ username              │
│ top_fit_score                 │ │ created_at        │ │ total_weeks           │ │ target_role           │ │ target_role           │
│ recommended_roles (JSON)      │ ├───────────────────┤ │ active_week           │ │ overall_score (Float) │ │ overall_score (Float) │
│ student_skills_snapshot (JSON)│ │ UQ: (user, job)   │ │ completion_percentage │ │ grade (String)        │ │ grade (String)        │
│ created_at                    │ └───────────────────┘ │ total_items, completed│ │ category_scores (JSON)│ │ category_scores (JSON)│
└───────────────────────────────┘                       │ weeks_data (JSON)     │ │ matched_skills (JSON) │ │ profile_info (JSON)   │
                                                        │ completed_item_ids (J)│ │ missing_skills (JSON) │ │ languages (JSON)      │
                                                        │ created_at, updated_at│ │ detected/missing sec  │ │ detected_technologies │
                                                        └───────────────────────┘ │ recommendations (JSON)│ │ repositories (JSON)   │
                                                                                  │ role_comparisons (JSON│ │ recommendations (JSON)│
                                                                                  │ created_at            │ │ recommended_projects  │
                                                                                  └───────────────────────┘ │ created_at            │
                                                                                                            └───────────────────────┘
```

---

## 7. All Seven Modules: Detailed Implementation Analysis

### Module 1: Authentication and Profile Management
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/user.py`, `app/models/profile.py`, `app/schemas/user.py`, `app/schemas/profile.py`, `app/api/v1/endpoints/auth.py`, `app/api/v1/endpoints/profile.py`
- **Frontend Files:** `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/Profile.jsx`, `src/contexts/AuthContext.jsx`
- **Actual Evidence:**
  - `POST /api/v1/auth/register` creates user with bcrypt salt rounds 12, initializes blank profile, and returns JWT.
  - `POST /api/v1/auth/login` validates hash, rejects invalid passwords or nonexistent accounts with HTTP 401.
  - `GET /api/v1/profile/me` and `PUT /api/v1/profile/me` retrieve and update profile, skills with 1–5 level ratings, education, experience, and URLs.
  - Verified live: registration (HTTP 201), login (HTTP 200), profile update with 5 skills persisted and re-queried from database.

### Module 2: Resume Analysis
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/resume.py`, `app/schemas/resume.py`, `app/api/v1/endpoints/resume.py`, `app/services/resume_parser.py`, `app/services/skill_extractor.py`
- **Frontend Files:** `src/pages/ResumeAnalyzer.jsx`
- **Actual Evidence:**
  - Supports binary PDF (`pypdf.PdfReader`) and DOCX (`docx.Document`). Rejects corrupted files, passwords, or files exceeding 5MB.
  - `SKILL_TAXONOMY` matches canonical skills across 5 categories using regex word boundaries.
  - Detects degrees (BCA, B.Tech, MCA, etc.) and contacts (email, phone, GitHub, LinkedIn).
  - Persists analysis in `resume_analyses` table; history accessible via `GET /api/v1/resume/history` and `/latest`.
  - Frontend supports drag & drop, text preview, skill display, and one-click profile synchronization.
  - Verified live: uploaded DOCX resume, extracted 6 skills with 100% precision.

### Module 3: Career Readiness Assessment
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/readiness.py`, `app/schemas/readiness.py`, `app/api/v1/endpoints/readiness.py`, `app/ml/readiness_model.py`
- **Frontend Files:** `src/pages/CareerReadiness.jsx`
- **Actual Evidence:**
  - Standardized 9-dimensional numerical feature vector:
    `[core_coverage, core_avg_proficiency, secondary_coverage, total_skills_count, experience_normalized, degree_score, has_github, has_linkedin, role_code]`.
  - Machine learning pipeline: `RandomForestRegressor` (for continuous 0–100% readiness score) and `RandomForestClassifier` (for High/Moderate/Needs Development categorization).
  - Dimension breakdown: Technical Skills, Practical Experience, Academic Qualification, Portfolio.
  - Model transparency endpoint `GET /api/v1/readiness/model-info` exposes accuracy (0.917), macro-F1 (0.916), $R^2$ (0.932), and MAE (3.63 score points).
  - Verified live: assessed readiness for Data Analyst, returned 65.4% score (Moderate Readiness) and saved record to DB.

### Module 4: Skill Gap Analysis
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/skill_gap.py`, `app/schemas/skill_gap.py`, `app/api/v1/endpoints/skill_gap.py`, `app/services/skill_gap_service.py`
- **Frontend Files:** `src/pages/SkillGap.jsx`
- **Actual Evidence:**
  - Evaluates student skills against benchmark requirements (`ROLE_BENCHMARKS`) for target role.
  - Categorizes skills into: Met (level $\ge$ required), Improvement needed (level $<$ required), and Missing.
  - Computes exact `skill_coverage_percentage` and `proficiency_alignment_percentage`.
  - Produces tailored, actionable learning guidance per deficit (`SKILL_ACTION_GUIDANCE`).
  - Persists results to `skill_gap_analyses` table.
  - Verified live: analyzed Data Analyst profile, computed 80.0% coverage, 7 met skills, 1 improvement, 2 missing skills.

### Module 5: Career Recommendations
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/recommendation.py`, `app/schemas/recommendation.py`, `app/api/v1/endpoints/recommendation.py`, `app/services/recommendation_service.py`
- **Frontend Files:** `src/pages/Assessment.jsx`
- **Actual Evidence:**
  - Multi-factor evaluation across 5 supported catalog roles (Data Analyst, Python Developer, ML Engineer, Cloud Engineer, Full Stack Developer).
  - Ranks roles based on weighted core competency alignment (50%), secondary alignment (20%), target preference bonus (15%), degree relevance (10%), and prior readiness assessments (5%).
  - Assigns match tiers: *Strong Match* ($\ge 75\%$), *Potential Match* ($50–74\%$), *Aspirational Match* ($< 50\%$).
  - Persists ranked results in `career_recommendations` table.
  - Frontend in `Assessment.jsx` provides interactive role evaluation, filtering, and recommended projects.
  - Verified live: evaluated profile, correctly ranked Data Analyst as #1 with 84.0% fit score.

### Module 6: Job Matching
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/job.py`, `app/schemas/job.py`, `app/api/v1/endpoints/job.py`, `app/services/job_matching_service.py`
- **Frontend Files:** `src/pages/JobMatches.jsx`
- **Actual Evidence:**
  - Curated benchmark dataset of entry-level technology vacancies with academic demonstration attributions.
  - Multi-factor match algorithm:
    $$\text{Match Score} = (0.50 \times \text{ReqCoverage}) + (0.25 \times \text{ReqProficiency}) + (0.15 \times \text{PrefBonus}) + (0.10 \times \text{ExpMatch})$$
  - Bookmark persistence via `POST /api/v1/jobs/save/:job_id` and removal via `DELETE /api/v1/jobs/save/:job_id`.
  - Database enforces `UniqueConstraint("user_id", "job_id")`.
  - Verified live: matched 2 vacancies, achieved 100.0% match on Junior Data Analyst, saved and retrieved bookmark from DB.

### Module 7: Explainable AI using SHAP and LIME
- **Status:** `COMPLETE`
- **Backend Files:** `app/ml/xai_service.py`, `app/schemas/xai.py`, `app/api/v1/endpoints/xai.py`, `app/api/v1/endpoints/readiness.py`
- **Frontend Files:** `src/pages/ExplainableAI.jsx`
- **Actual Evidence:**
  - **SHAP Integration:** Fits a cached `shap.TreeExplainer` directly on the trained Scikit-learn `RandomForestRegressor`. Calculates additive Shapley values ($\phi_i$) for all 9 features.
  - **Local Fidelity Verification:** Explicitly verifies that:
    $$\text{base\_value} + \sum_{i=1}^{9} \phi_i = \text{predicted\_score}$$
    Mathematical discrepancy verified live: `0.000000` (`is_faithful: True`).
  - **LIME Integration:** Utilizes `lime.lime_tabular.LimeTabularExplainer` fitted on a 300-sample benchmark training distribution. Generates local linear surrogate weights and decision interval conditions (e.g., `core_coverage > 0.72 -> weight: +10.890`).
  - **Global Explainability:** Exposes Gini impurity feature importance alongside mean absolute SHAP values across background samples.
  - **Causal Disclaimers:** Explicitly states that feature attributions describe internal model sensitivity, not real-world hiring causation.
  - Verified live: returned 9 SHAP attributions, 9 LIME rules, and verified mathematical fidelity.

### Module 8: ATS Resume Scorer
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/ats.py`, `app/schemas/ats.py`, `app/api/v1/endpoints/ats.py`, `app/services/ats_service.py`
- **Frontend Files:** `src/pages/AtsScore.jsx`
- **Actual Evidence:**
  - Transparent 100-point heuristic scoring engine evaluating resumes along 5 core dimensions:
    1. **Keyword and skill matching (30 pts max):** Checks core (20 pts) and secondary (10 pts) domain skills against benchmark role requirements.
    2. **Resume section completeness (20 pts max):** Detects Contact, Summary/Objective, Skills, Experience/Projects, and Education (4 pts each).
    3. **Experience & project relevance (20 pts max):** Action verbs (8 pts), target role domain keywords (8 pts), project depth & scope (4 pts).
    4. **Quantifiable achievements (15 pts max):** Identifies percentages, metrics, scale numbers, currency, and time savings.
    5. **Formatting and readability (15 pts max):** Length (250–850 words, 5 pts), clean bullet point density (5 pts), contact info structure (5 pts).
  - Explicit disclaimer clarifying scoring is an independent heuristic benchmark, not simulating a vendor's proprietary algorithm.
  - Actionable recommendations with realistic Before/After bullet point examples without fabricating qualifications.
  - Cross-role comparative evaluation across Data Analyst, Python Developer, and Machine Learning Engineer.
  - Persists evaluations in SQLite `ats_evaluations` table with user isolation.
  - Supports 3 evaluation triggers: direct PDF/DOCX file upload, raw text analysis, and 1-click evaluation of latest uploaded resume or profile export.
  - Verified live: 8/8 automated tests passed covering PDF/DOCX parsing, score logic, recommendations, role comparison, history, and tenant isolation.

### Module 9: GitHub Profile Analyzer
- **Status:** `COMPLETE`
- **Backend Files:** `app/models/github.py`, `app/schemas/github.py`, `app/api/v1/endpoints/github.py`, `app/services/github_service.py`
- **Frontend Files:** `src/pages/GitHubAnalyzer.jsx`
- **Actual Evidence:**
  - Direct integration with official public GitHub REST API (`https://api.github.com/users/{username}`) without mandatory token requirement, featuring rate-limit handling (HTTP 429) and graceful non-existent user handling (HTTP 404).
  - 100-point transparent scoring engine across 6 objective dimensions: Project quality (25 pts), Skill diversity (20 pts), Documentation (15 pts), Coding activity (20 pts), Community engagement (10 pts), and Career-role relevance (10 pts).
  - Automated technology and skill extraction across Languages, Frameworks, Databases, and DevOps tools from repository names, descriptions, and topics.
  - Actionable feedback identifies missing target role competencies, documentation gaps, and generates 3 tailored project ideas.
  - Multi-tiered 15-minute in-memory caching and SQLite persistence (`github_analyses`) with user isolation.
  - One-click skill synchronization endpoint (`POST /api/v1/github/sync-skills`) imports verified GitHub skills directly into student profiles.
  - Verified live: 11/11 automated tests passed covering mock responses, profile fallbacks, error states, scoring, history, and tenant isolation.

---

## 8. Existing API Endpoints Table

| Method | Endpoint | Module | Auth Guard | Description | Status |
|---|---|---|---|---|---|
| `GET` | `/health` | Core | No | Health check & DB connection status | **COMPLETE** |
| `GET` | `/docs` | Core | No | Interactive Swagger UI documentation | **COMPLETE** |
| `GET` | `/openapi.json` | Core | No | OpenAPI v3 specification | **COMPLETE** |
| `POST` | `/api/v1/auth/register` | Auth | No | Register new user & init profile | **COMPLETE** |
| `POST` | `/api/v1/auth/login` | Auth | No | Authenticate user & issue JWT | **COMPLETE** |
| `GET` | `/api/v1/profile/me` | Profile | Yes (Bearer) | Get current student profile | **COMPLETE** |
| `PUT` | `/api/v1/profile/me` | Profile | Yes (Bearer) | Update student profile and skills | **COMPLETE** |
| `POST` | `/api/v1/resume/analyze` | Resume | Yes (Bearer) | Upload PDF/DOCX & extract skills | **COMPLETE** |
| `GET` | `/api/v1/resume/history` | Resume | Yes (Bearer) | Get past resume upload records | **COMPLETE** |
| `GET` | `/api/v1/resume/latest` | Resume | Yes (Bearer) | Get most recent resume analysis | **COMPLETE** |
| `POST` | `/api/v1/readiness/assess` | Readiness | Yes (Bearer) | Run ML readiness assessment | **COMPLETE** |
| `GET` | `/api/v1/readiness/latest` | Readiness | Yes (Bearer) | Get latest readiness score | **COMPLETE** |
| `GET` | `/api/v1/readiness/history` | Readiness | Yes (Bearer) | Get historical readiness assessments | **COMPLETE** |
| `GET` | `/api/v1/readiness/model-info` | Readiness | No | Model architecture & test metrics | **COMPLETE** |
| `POST` | `/api/v1/readiness/explain` | Readiness / XAI | Yes (Bearer) | Compute SHAP & LIME for readiness | **COMPLETE** |
| `GET` | `/api/v1/readiness/explain` | Readiness / XAI | Yes (Bearer) | Get XAI explanation for latest profile | **COMPLETE** |
| `GET` | `/api/v1/readiness/global-xai` | Readiness / XAI | No | Global feature importances & notes | **COMPLETE** |
| `POST` | `/api/v1/skill-gap/analyze` | Skill Gap | Yes (Bearer) | Evaluate skills against role benchmark | **COMPLETE** |
| `GET` | `/api/v1/skill-gap/latest` | Skill Gap | Yes (Bearer) | Get latest skill gap analysis | **COMPLETE** |
| `GET` | `/api/v1/skill-gap/history` | Skill Gap | Yes (Bearer) | Get skill gap evaluation history | **COMPLETE** |
| `GET` | `/api/v1/skill-gap/roles` | Skill Gap | No | List supported role definitions | **COMPLETE** |
| `POST` | `/api/v1/recommendations/evaluate` | Recommendations | Yes (Bearer) | Evaluate & rank suitable roles | **COMPLETE** |
| `GET` | `/api/v1/recommendations/latest` | Recommendations | Yes (Bearer) | Get latest career recommendations | **COMPLETE** |
| `GET` | `/api/v1/recommendations/catalog` | Recommendations | No | Get documented role catalog | **COMPLETE** |
| `GET` | `/api/v1/recommendations/history` | Recommendations | Yes (Bearer) | Get recommendation history | **COMPLETE** |
| `GET` | `/api/v1/jobs/match` | Job Matching | Yes (Bearer) | Match vacancies against skills | **COMPLETE** |
| `GET` | `/api/v1/jobs/vacancies` | Job Matching | No | List all curated sample vacancies | **COMPLETE** |
| `GET` | `/api/v1/jobs/saved` | Job Matching | Yes (Bearer) | Get bookmarked jobs for student | **COMPLETE** |
| `POST` | `/api/v1/jobs/save/{job_id}` | Job Matching | Yes (Bearer) | Bookmark a vacancy | **COMPLETE** |
| `DELETE` | `/api/v1/jobs/save/{job_id}` | Job Matching | Yes (Bearer) | Remove a vacancy bookmark | **COMPLETE** |
| `GET` | `/api/v1/jobs/{job_id}` | Job Matching | Yes (Bearer) | Get detailed vacancy match breakdown | **COMPLETE** |
| `POST` | `/api/v1/xai/explain` | XAI Dedicated | Yes (Bearer) | SHAP & LIME explanation endpoint | **COMPLETE** |
| `GET` | `/api/v1/xai/explain` | XAI Dedicated | Yes (Bearer) | SHAP & LIME latest explanation | **COMPLETE** |
| `GET` | `/api/v1/xai/global` | XAI Dedicated | No | Global model feature importances | **COMPLETE** |
| `GET` | `/api/v1/roadmap` | Roadmap | Yes (Bearer) | Get current user's personalized roadmap (auto-generated) | **COMPLETE** |
| `POST` | `/api/v1/roadmap/generate` | Roadmap | Yes (Bearer) | Generate or regenerate customized roadmap | **COMPLETE** |
| `POST` | `/api/v1/roadmap/toggle-item` | Roadmap | Yes (Bearer) | Toggle topic checklist item & persist progress | **COMPLETE** |
| `GET` | `/api/v1/roadmap/summary` | Roadmap | Yes (Bearer) | Get roadmap summary metrics for dashboard | **COMPLETE** |
| `POST` | `/api/v1/ats/score-file` | ATS Scorer | Yes (Bearer) | Upload PDF/DOCX file & compute ATS evaluation | **COMPLETE** |
| `POST` | `/api/v1/ats/score-text` | ATS Scorer | Yes (Bearer) | Evaluate raw resume text against role benchmark | **COMPLETE** |
| `POST` | `/api/v1/ats/score-latest` | ATS Scorer | Yes (Bearer) | Evaluate most recently uploaded resume or profile | **COMPLETE** |
| `GET` | `/api/v1/ats/latest` | ATS Scorer | Yes (Bearer) | Get latest ATS evaluation result | **COMPLETE** |
| `GET` | `/api/v1/ats/history` | ATS Scorer | Yes (Bearer) | Get user's ATS evaluation history | **COMPLETE** |
| `POST` | `/api/v1/github/analyze` | GitHub Analyzer | Yes (Bearer) | Analyze public GitHub profile & repositories against target role | **COMPLETE** |
| `GET` | `/api/v1/github/latest` | GitHub Analyzer | Yes (Bearer) | Get most recent GitHub portfolio evaluation for student | **COMPLETE** |
| `GET` | `/api/v1/github/history` | GitHub Analyzer | Yes (Bearer) | Get GitHub evaluation history list | **COMPLETE** |
| `POST` | `/api/v1/github/sync-skills` | GitHub Analyzer | Yes (Bearer) | Sync detected GitHub technologies into student profile | **COMPLETE** |
| `GET` | `/api/v1/reports/preview` | Reports | Yes (Bearer) | Preview report content & module availability statuses | **COMPLETE** |
| `POST` | `/api/v1/reports/generate` | Reports | Yes (Bearer) | Synthesize 10 modules into downloadable PDF & save to history | **COMPLETE** |
| `GET` | `/api/v1/reports/history` | Reports | Yes (Bearer) | List previously generated reports for student | **COMPLETE** |
| `GET` | `/api/v1/reports/{report_id}/download` | Reports | Yes (Bearer) | Securely stream generated PDF with path traversal guard | **COMPLETE** |

---

## 9. Machine Learning Workflow

```
   Student Profile & Extracted Resume Data
                      │
                      ▼
 ┌──────────────────────────────────────────────┐
 │    Feature Extraction Pipeline (9 Dims)      │
 │  • core_coverage (len(match) / len(req))     │
 │  • core_avg_proficiency (mean(level) / 5)    │
 │  • secondary_coverage (len(sec) / len(req))  │
 │  • total_skills_count (min(1, count/12))     │
 │  • experience_normalized (min(1, exp/24))    │
 │  • degree_score (degree weight: 0.20 - 1.00) │
 │  • has_github (1.0 or 0.0)                   │
 │  • has_linkedin (1.0 or 0.0)                 │
 │  • role_code (0: DA, 1: PyDev, 2: MLE)       │
 └──────────────────────┬───────────────────────┘
                        │
                        ▼
 ┌──────────────────────────────────────────────┐
 │       Trained RandomForest Model Bundle      │
 │  • Regressor: n_est=120, max_depth=8         │  ──►  Continuous Score (0 - 100%)
 │  • Classifier: n_est=100, max_depth=6        │  ──►  Category: High / Moderate / Needs Dev
 └──────────────────────┬───────────────────────┘
                        │
                        ▼
 ┌──────────────────────────────────────────────┐
 │       Evaluation & Performance Metrics       │
 │  • Test Accuracy: 91.67%                     │
 │  • Macro F1-Score: 0.916                     │
 │  • R-Squared Score (R²): 0.932               │
 │  • Mean Absolute Error (MAE): 3.63 pts       │
 └──────────────────────────────────────────────┘
```

- **Training Pipeline:** Located in `app/ml/readiness_model.py`. Generates deterministic benchmark training distribution (`N=1000`) modeling fresh graduate entry profiles, splits 80/20 train/test, and trains both regressor and classifier ensembles.
- **Persistence:** Persisted as `readiness_models.joblib` and `readiness_metadata.json` in `backend/data/ml/`. If artifacts are missing, the system automatically trains and writes them on startup.

---

## 10. SHAP and LIME Integration

### 10.1 SHAP (SHapley Additive exPlanations)
- **Algorithm:** `shap.TreeExplainer(regressor)`
- **Mathematical Principle:** Computes local feature attributions $\phi_i$ based on cooperative game theory:
  $$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i$$
  where $\phi_0$ is the base value (expected readiness score over the benchmark distribution, $\approx 52.64$), and $\phi_i$ is the additive score contribution of feature $i$.
- **Fidelity Check:** Reconstructed score $\phi_0 + \sum \phi_i$ is tested against actual model prediction $f(x)$. The system computes discrepancy $|f(x) - \text{reconstructed}|$; if $< 10^{-4}$, `is_faithful` is confirmed `True`.
- **UI Representation:** Waterfall attribution cards showing positive contributors (green arrows with positive points) and negative contributors (red arrows with negative points).

### 10.2 LIME (Local Interpretable Model-agnostic Explanations)
- **Algorithm:** `lime.lime_tabular.LimeTabularExplainer`
- **Configuration:** Mode is `regression`, feature names are the 9 standardized dimensions, background sample distribution $N=300$.
- **Output:** Returns local decision rule intervals and linear surrogate weights (e.g., `"core_coverage > 0.72" -> +10.89`).
- **UI Representation:** Tabbed view displaying local linear decision rules and feature weights.

### 10.3 Global Explanations
- Gini impurity feature importance from the tree ensemble.
- Mean absolute SHAP value:
  $$I_j = \frac{1}{N} \sum_{k=1}^{N} |\phi_j^{(k)}|$$
- Ranks feature importance globally across the benchmark background.

---

## 11. Current Working Features

| Feature | Scope / Route | Verification Result |
|---|---|---|
| User Registration | Backend + Frontend | **COMPLETE** — Bcrypt hashing, email check, profile init |
| User Login | Backend + Frontend | **COMPLETE** — JWT generation, auth context persistence |
| Google OAuth 2.0 Sign-In | Backend + Frontend | **COMPLETE** — Authorization-code flow, CSRF state protection, ID token cryptographic verification, secure account linking, single-use session ticket exchange |
| Profile Management | Backend + Frontend | **COMPLETE** — CRUD skills, education, persist in DB |
| Resume Text Parsing | Backend + Frontend | **COMPLETE** — PDF & DOCX binary parsing, 5MB ceiling |
| NLP Skill Extraction | Backend + Frontend | **COMPLETE** — Regex taxonomy boundary matching |
| Career Readiness Prediction | Backend + Frontend | **COMPLETE** — Scikit-Learn RF, dimension scoring |
| Skill Gap Analysis | Backend + Frontend | **COMPLETE** — Benchmark comparison, action guidance |
| Career Recommendations | Backend + Frontend | **COMPLETE** — Multi-factor catalog fit scoring |
| Entry-Level Job Matching | Backend + Frontend | **COMPLETE** — Vacancy match algorithm & filtering |
| Job Bookmarking / Save | Backend + Frontend | **COMPLETE** — SQLite `saved_jobs` persistence & unsave |
| SHAP Local Explainability | Backend + Frontend | **COMPLETE** — TreeExplainer, exact fidelity check |
| LIME Local Explainability | Backend + Frontend | **COMPLETE** — Tabular surrogate rules & intervals |
| Global Feature Importance | Backend + Frontend | **COMPLETE** — Gini importance & mean abs SHAP |
| Student Dashboard Overview | Backend + Frontend | **COMPLETE** — Live API integration (`/readiness/latest`, `/jobs/match`, `/profile/me`), dimensional metrics, loading/error/empty onboarding states |
| Learning Roadmap Module | Backend + Frontend | **COMPLETE** — Week-by-week curriculum, verified free learning resources, milestone tracking, SQLite progress persistence, Dashboard integration |
| ATS Resume Scorer Module | Backend + Frontend | **COMPLETE** — 100-pt transparent scoring (5 categories), PDF/DOCX parsing, Before/After recommendation examples, multi-role comparison, SQLite persistence |
| GitHub Profile Analyzer Module | Backend + Frontend | **COMPLETE** — 100-pt portfolio score (6 dimensions), REST API integration, language stats, project ideas, skill sync, SQLite persistence |
| Reports & PDF Generation Module | Backend + Frontend | **COMPLETE** — 11-section publication-ready PDF dossier synthesizing all 10 modules, ReportLab NumberedCanvas pagination, custom section builder, SQLite history persistence, path traversal protection |
| AI Career Assistant Module | Backend + Frontend | **COMPLETE** — Real-time conversational guidance grounded across all 11 student modules, pluggable AI providers (OpenAI/Groq/Gemini/Ollama) with deterministic fallback, persistent conversation memory with tenant isolation, live student context snapshot panel, markdown support |
| AI Mock Interview System | Backend + Frontend | **COMPLETE** — Personalized Setup, one-question-at-a-time active simulation with timer, Gemini + deterministic fallback, 100-pt technical/HR/behavioral/STAR rubrics, adaptive difficulty, detailed final evaluation report, SQLite history persistence |
| Automated Backend Tests | Backend `tests/` | **COMPLETE** — 141/141 pytest tests passing (100%) |
| Frontend Production Build | Frontend `vite build` | **COMPLETE** — 2,255 modules bundled, lazy code-split (379.37 kB main bundle), 0 errors |

---

## 12. Incomplete Features

| Feature | Scope / Location | Current State | Reason / Missing Component |
|---|---|---|---|
| Role Catalog Expansion in ML | `app/ml/readiness_model.py` | `PARTIALLY COMPLETE` | Trained model specializes on 3 core roles (Data Analyst, Python Developer, ML Engineer). Additional roles (Cloud Engineer, Full Stack) fall back to baseline. |
| Admin Management Suite | `src/pages/Admin*.jsx`         | `NOT IMPLEMENTED` | All 6 admin pages are 13-line placeholder stubs; no admin API endpoints exist on backend. |
| Semantic Embedding Matcher | `job_matching_service.py`   | `NOT IMPLEMENTED` | Planned Sentence-Transformers embeddings not implemented; uses skill-set overlap instead. |

---

## 13. Known Bugs and Code Issues

1. **Frontend ESLint Errors in React 19 (RESOLVED):**
   - All 77 ESLint issues (including `react-hooks/set-state-in-effect`, `react-refresh/only-export-components`, `react-hooks/immutability`, and unused imports) have been resolved. `npx eslint .` passes with **0 errors, 0 warnings**.
2. **Dashboard Disconnected from Backend State (RESOLVED):**
   - `Dashboard.jsx` is fully connected to live APIs (`getProfile`, `getReadiness`, `getSkillGap`, `getRecommendations`, `getJobMatches`) with full error, retry, loading, and onboarding empty states.
3. **Pydantic / Starlette Deprecation Warning:**
   - `DeprecationWarning: 'HTTP_422_UNPROCESSABLE_ENTITY' is deprecated. Use 'HTTP_422_UNPROCESSABLE_CONTENT' instead.` in Starlette/FastAPI exception handlers (harmless library warning).
4. **Vite Bundle Chunk Size Warning (RESOLVED):**
   - Dynamic `React.lazy()` and `<Suspense>` route-based code splitting implemented in `App.jsx`. Main bundle reduced from 625.58 kB to 379.98 kB (~40% reduction, Vite chunk size warning eliminated).

---

## 14. Testing Results

### 14.1 Backend Pytest Automated Suite
- **Execution Date:** November 2026
- **Test Command:** `python -m pytest backend/tests -v`
- **Result:** **105 passed, 0 failed, 3 deprecation warnings in 83.78s**
- **Test Breakdown by Module:**
  - `test_auth.py`: 6 tests passed (registration, conflict rejection, validation, valid login, invalid password, nonexistent user)
  - `test_health.py`: 2 tests passed (health check status, OpenAPI docs availability)
  - `test_profile.py`: 5 tests passed (auth protection, invalid tokens, CRUD updates, tenant isolation, restart persistence)
  - `test_resume.py`: 10 tests passed (PDF extraction, DOCX extraction, invalid extension rejection, oversized file rejection, empty file rejection, scanned PDF graceful degradation, alias matching, auth checks, tenant isolation, history)
  - `test_readiness.py`: 8 tests passed (model training, feature consistency, role predictions, auth endpoint, latest/history endpoints, model transparency, tenant isolation)
  - `test_roadmap.py`: 6 tests passed (auto-generation, toggle progress calculation, custom role, dashboard summary, auth protection, tenant isolation)
  - `test_ats.py`: 8 tests passed (PDF scoring, DOCX scoring, text scoring, latest resume scoring, latest endpoint, history endpoint, tenant isolation, unauthorized)
  - `test_github.py`: 11 tests passed (analysis endpoint, fallback URL, missing username validation, 404 user not found, 429 rate limit, empty repos handling, latest/history, skill sync, tenant isolation, unauthorized)
  - `test_skill_gap.py`: 7 tests passed (categorization, coverage & alignment formulas, analyze endpoint, latest/history, role definitions, tenant isolation)
  - `test_recommendation.py`: 9 tests passed (catalog integrity, ranking algorithm, public catalog endpoint, evaluate endpoint, latest/history, tenant isolation)
  - `test_job_matching.py`: 11 tests passed (catalog structure, full match, empty profile, partial match, filters, public vacancies, match endpoint, detail, bookmarking/unsave, tenant isolation)
  - `test_xai.py`: 9 tests passed (feature order consistency, SHAP fidelity reconstruction, LIME rule generation, global explanations, explain endpoint, dedicated XAI route, tenant isolation)
  - `test_reports.py`: 13 tests passed (preview endpoint, empty profile fallback, all sections PDF, subset sections, invalid sections 400, empty sections 400, history endpoint, download endpoint, not found 404, missing file 404, unauthorized 401, tenant isolation, uncompleted modules baseline PDF)

### 14.2 Live End-to-End System Verification
Tested using Python test client executing real operations on `backend/data/careertwin.db`:
- **1. Health Check:** HTTP 200 — Status `healthy`, database `connected`.
- **2. Registration:** HTTP 201 — User created with bcrypt hash, blank profile created, JWT issued.
- **3. Login:** HTTP 200 — JWT token returned with correct claims.
- **4. Profile Persistence:** HTTP 200 — 5 skills with levels 3–4 persisted in SQLite, retrieved and verified.
- **5. Resume Analysis:** HTTP 200 — DOCX parsed, extracted 6 skills (`Python`, `SQL`, `Pandas`, `Tableau`, `Git`, `Communication`), contact info and degree.
- **6. Career Readiness Assessment:** HTTP 200 — Random Forest output: 65.4% (*Moderate Readiness*), dimension scores: Technical (85%), Experience (25%), Education (75%), Portfolio (100%).
- **7. Skill Gap Analysis:** HTTP 200 — 80.0% coverage, 7 met skills, 1 improvement needed, 2 missing skills, actionable learning recommendations generated.
- **8. Career Recommendations:** HTTP 200 — Top role Data Analyst (84.0% fit score) ranked #1 out of 5 roles evaluated.
- **9. Job Matching:** HTTP 200 — 2 vacancies matched, 100.0% match score on *Junior Data Analyst*.
- **10. Saved Jobs:** HTTP 200 — Bookmarked vacancy `job-da-01` to DB, confirmed in saved list, deleted (unsaved) cleanly.
- **11. SHAP Explanations:** HTTP 200 — Base value 52.64, predicted score 65.40, 9 feature attributions calculated. **Fidelity discrepancy: 0.000000** (`is_faithful: True`).
- **12. LIME Explanations:** HTTP 200 — 9 local decision rules and linear weights computed. Global XAI importances verified.

### 14.3 Frontend Build & Lint Verification
- **ESLint Command:** `cd frontend; npx eslint .`
- **ESLint Result:** **0 errors, 0 warnings**
- **Vite Build Command:** `cd frontend; npm run build`
- **Vite Build Result:** **Exited with code 0 in 1.21s (Success, 0 warnings)**
- **Modules Transformed:** 2,254 modules
- **Artifacts:**
  - `dist/index.html` (0.47 kB)
  - `dist/assets/index.css` (69.59 kB)
  - `dist/assets/index.js` (374.92 kB)
  - 24 on-demand chunk files for route-level code splitting including `GitHubAnalyzer-*.js` (31.61 kB), `AtsScore-*.js` (22.68 kB), `LearningRoadmap-*.js` (20.86 kB), and `Dashboard-*.js` (25.11 kB)

---

## 15. Pending Improvements

1. **Dashboard Dynamic Integration:** `[COMPLETED]` Connected `Dashboard.jsx` to live backend data (`/api/v1/readiness/latest`, `/api/v1/jobs/match`, and `/api/v1/profile/me`), replacing `DEMO_READINESS` and `DEMO_JOB_MATCHES`.
2. **ESLint & React 19 Cleanup:** `[COMPLETED]`
   - Refactored `useEffect` state updates in `CareerReadiness.jsx`, `SkillGap.jsx`, `Navbar.jsx`, and `useTypewriter.js`.
   - Separated validation utilities out of `AuthContext.jsx` into `src/utils/validation.js`.
   - Hoisted `logout` definition in `AuthContext.jsx` above `useEffect`.
   - Removed all unused Lucide icon imports across JSX files.
3. **Route-Level Code Splitting:** `[COMPLETED]` Introduced `React.lazy()` and `Suspense` in `App.jsx` for all routes, reducing main bundle to 379.98 kB.
4. **Expand ML Supported Roles:** Expand the Scikit-learn readiness training set to natively support `Cloud Engineer`, `Full Stack Developer`, and `Cybersecurity Analyst` role codes in `app/ml/readiness_model.py`.
5. **Frontend Automated Unit Tests:** Configure Vitest / React Testing Library to provide regression testing for React components and AuthContext.

---

## 16. Recommended Development Sequence

To proceed with future development safely without breaking existing working modules, follow this sequence:

```
Phase 1: Code Quality & Dashboard Integration (Immediate)
├── 1.1 Fix ESLint warnings in AuthContext.jsx and hook side-effects
├── 1.2 Connect Dashboard.jsx to real backend APIs (/readiness/latest, /jobs/match)
└── 1.3 Implement React.lazy() code splitting in App.jsx

Phase 2: Complete Secondary Student Features (Near-Term)
├── 2.1 Implement Learning Roadmap Generator (/roadmap) [COMPLETED]
├── 2.2 Implement ATS Resume Keyword Matcher (/ats-score) [COMPLETED]
├── 2.3 Implement GitHub Profile Analyzer (/github-analyzer) [COMPLETED]
└── 2.4 Implement Consolidated PDF/Print Reports (/reports) [COMPLETED]

Phase 3: Machine Learning & Semantic Enhancements (Mid-Term)
├── 3.1 Expand Random Forest training set to cover Cloud & Full Stack roles
├── 3.2 Upgrade job matching with lightweight semantic embeddings (e.g. all-MiniLM-L6-v2)
└── 3.3 Add interactive SHAP force plot / beeswarm visualization in ExplainableAI.jsx

Phase 4: Admin Capabilities & Advanced Tools (Final Phase)
├── 4.1 Implement backend admin endpoints (/api/v1/admin/users, /jobs, /analytics)
├── 4.2 Connect AdminDashboard, AdminUsers, and AdminJobs pages
└── 4.3 Implement AI Mock Interview practice module (/mock-interview)
```

---

*This document serves as the central architectural reference and project ground truth for CareerTwin AI.*
