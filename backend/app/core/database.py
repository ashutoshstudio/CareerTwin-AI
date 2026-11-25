from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# If using SQLite with a file path, ensure directory exists
if settings.DATABASE_URL.startswith("sqlite:///"):
    db_path_str = settings.DATABASE_URL.replace("sqlite:///", "")
    # handle relative or absolute path
    db_path = Path(db_path_str)
    if not db_path.is_absolute():
        db_path = Path.cwd() / db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a clean database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Creates database tables automatically during development."""
    # Import models here so Base.metadata has registered them
    import app.models.user  # noqa: F401
    import app.models.profile  # noqa: F401
    import app.models.resume  # noqa: F401
    import app.models.readiness  # noqa: F401
    import app.models.skill_gap  # noqa: F401
    import app.models.recommendation  # noqa: F401
    import app.models.job  # noqa: F401
    import app.models.roadmap  # noqa: F401
    import app.models.ats  # noqa: F401
    import app.models.github  # noqa: F401
    import app.models.report  # noqa: F401
    import app.models.career_assistant  # noqa: F401
    import app.models.mock_interview  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Ensure backward-compatible SQLite columns exist on pre-existing databases
    with engine.begin() as conn:
        if settings.DATABASE_URL.startswith("sqlite"):
            cols = {row[1] for row in conn.execute(text("PRAGMA table_info(users)")).fetchall()}
            if cols:
                if "google_id" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
                    conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id)"))
                if "auth_provider" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'local'"))
