import os
import uuid
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

def _get_default_url() -> str:
    return 'sqlite:///./sugarcare.db'
DATABASE_URL = os.getenv('DATABASE_URL', _get_default_url())
if DATABASE_URL.startswith('sqlite'):
    engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def gen_uuid() -> str:
    return str(uuid.uuid4())

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()