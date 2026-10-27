# CareerTwin AI — Backend Server (FastAPI + SQLite)

Welcome to the **CareerTwin AI** backend service. This service provides the RESTful API for student authentication, profile management, career readiness prediction, skill gap analysis, and explainable AI insights for the CareerTwin AI ecosystem.

---

## 1. Technology Stack

- **Framework:** FastAPI (Python 3.11+)
- **Server:** Uvicorn (ASGI)
- **Database:** SQLite
- **ORM:** SQLAlchemy 2.0
- **Validation & Serialization:** Pydantic v2
- **Password Hashing:** Bcrypt (12 rounds)
- **Token Security:** PyJWT (HS256)
- **Testing:** Pytest & HTTPX TestClient

---

## 2. Directory Layout

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point, CORS, lifespan, health
│   ├── core/
│   │   ├── config.py            # Pydantic Settings & environment variable loader
│   │   ├── database.py          # SQLAlchemy engine, session maker, get_db dependency
│   │   └── security.py          # Bcrypt hashing & JWT access token encode/decode
│   ├── models/
│   │   ├── user.py              # User database model
│   │   └── profile.py           # StudentProfile database model (skills JSON support)
│   ├── schemas/
│   │   ├── user.py              # Registration, Login, UserOut schemas
│   │   ├── profile.py           # ProfileOut, ProfileUpdate, SkillItem schemas
│   │   └── token.py             # Token response schemas
│   └── api/
│       ├── deps.py              # Authentication dependencies (get_current_user)
│       └── v1/
│           ├── api.py           # Aggregate v1 router
│           └── endpoints/
│               ├── auth.py      # /api/v1/auth/register and /api/v1/auth/login
│               └── profile.py   # /api/v1/profile/me (GET & PUT)
├── data/
│   └── careertwin.db            # SQLite database file (auto-generated during development)
├── tests/
│   ├── conftest.py              # Isolated in-memory SQLite fixtures for pytest
│   ├── test_health.py           # /health and /docs endpoint verification
│   ├── test_auth.py             # Registration, duplicates, passwords, and login tests
│   └── test_profile.py          # Profile isolation, updates, and persistence tests
├── requirements.txt             # Python package dependencies
├── .env.example                 # Environment configuration template
└── README.md                    # Backend setup and API reference (this file)
```

---

## 3. Getting Started & Local Setup

### Step 1: Open Terminal in `backend/` Directory

```bash
cd backend
```

### Step 2: Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Default configuration in `.env`:
```env
APP_NAME=CareerTwin AI Backend
APP_ENV=development
DEBUG=True
HOST=127.0.0.1
PORT=8000

SECRET_KEY=careertwin-development-insecure-secret-key-change-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DATABASE_URL=sqlite:///./data/careertwin.db
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 4. Database Location & Auto-Initialization

- The SQLite database file is stored in `backend/data/careertwin.db`.
- Database tables (`users` and `student_profiles`) are **created automatically** upon application startup via the FastAPI lifespan handler in `app/main.py`.
- No manual migrations are required for local development.

---

## 5. Running the Backend Server

Start the Uvicorn development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running:
- **API Server:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 6. Running Tests

To run the automated test suite with verbose output:

```bash
pytest -v
```

All tests execute against an isolated in-memory test database, guaranteeing zero pollution of the local development database.

---

## 7. Implemented API Endpoints

### 7.1 Health & Diagnostics
- `GET /health`  
  Checks application status and confirms database connectivity.

### 7.2 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register`  
  Registers a new user account with secure Bcrypt password hashing.  
  *Payload:* `{"email": "student@example.com", "full_name": "Alex Johnson", "password": "Password123!"}`  
  *Response (201):* `{"access_token": "...", "token_type": "bearer", "user": {...}}`

- `POST /api/v1/auth/login`  
  Validates credentials and returns a JWT access token.  
  *Payload:* `{"email": "student@example.com", "password": "Password123!"}`  
  *Response (200):* `{"access_token": "...", "token_type": "bearer", "user": {...}}`

### 7.3 Student Profile (`/api/v1/profile`)
- `GET /api/v1/profile/me`  
  Requires `Authorization: Bearer <token>` header.  
  Returns full user profile, target career role, and skills list.

- `PUT /api/v1/profile/me`  
  Requires `Authorization: Bearer <token>` header.  
  Updates personal details, headline, education level, institution, graduation year, experience in months, portfolio links, target role, and skills with proficiency levels.
