from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine
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

    Base.metadata.create_all(bind=engine)
