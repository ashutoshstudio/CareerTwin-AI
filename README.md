# CareerTwin AI

## CareerTwin AI: An Explainable Machine Learning-Based Career Readiness, Skill Gap and Job Matching System

A final-year BCA Data Science project that helps students and job seekers understand their career readiness, identify skill gaps, and match with relevant job opportunities — powered by explainable machine learning.

---

## Project Overview

CareerTwin AI acts as a personalized digital career twin. It analyzes a user's current skills, education, experience, and goals, then:

- **Assesses career readiness** using trained ML models
- **Identifies skill gaps** by comparing user profiles against job role requirements
- **Matches users to relevant jobs** using semantic similarity and ML-based ranking
- **Explains every recommendation** using XAI techniques (SHAP, LIME) so users understand *why* a result was produced

This project is designed to run entirely on **localhost** and is intended as an academic demonstration of applied Data Science and Machine Learning concepts.

---

## Planned Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | UI framework and build tool |
| Axios | HTTP client for API communication |
| Recharts / Chart.js | Data visualization (skill gap charts, readiness scores) |
| React Router | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Primary backend language |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| SQLAlchemy | ORM for database interaction |
| Pydantic | Data validation and serialization |
| python-dotenv | Environment variable management |

### Machine Learning
| Technology | Purpose |
|---|---|
| scikit-learn | Core ML algorithms (classification, clustering) |
| pandas | Data manipulation and preprocessing |
| NumPy | Numerical computation |
| SHAP | Explainable AI — feature importance explanations |
| LIME | Local explainability for individual predictions |
| Sentence-Transformers | Semantic job matching using embeddings |
| Matplotlib / Seaborn | Visualization for ML reports and analysis |
| Jupyter Notebook | Exploratory data analysis and model development |

### Database
| Technology | Purpose |
|---|---|
| SQLite (development) | Lightweight local database |

### Dev Tools
| Technology | Purpose |
|---|---|
| Git | Version control |
| GitHub | Remote code repository |
| VS Code | Primary IDE |

---

## Project Structure

```
CareerTwin-AI/
│
├── frontend/       # React (Vite) user interface
├── backend/        # FastAPI REST API server
├── ml/             # Machine learning models, notebooks, and pipelines
├── docs/           # Project documentation, reports, and references
├── README.md       # Project overview (this file)
├── .gitignore      # Git ignore rules
└── .env.example    # Environment variable template
```

---

## Key Features (Planned)

- [ ] User profile creation (skills, education, experience)
- [ ] Career readiness score prediction (ML model)
- [ ] Skill gap analysis with visual charts
- [ ] Job matching using semantic similarity
- [ ] Explainable AI output using SHAP / LIME
- [ ] Resume parsing support
- [ ] Dashboard with analytics and recommendations

---

## Academic Context

- **Degree**: Bachelor of Computer Applications (BCA)
- **Specialization**: Data Science
- **Project Type**: Final Year Project
- **Scope**: Localhost application

---

## Getting Started

### 1. Backend Setup (FastAPI + SQLite)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Server: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Interactive Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Automated Tests: `pytest -v`

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
- Client Application: [http://localhost:5173](http://localhost:5173)

---

## License

This project is created for academic purposes only.
