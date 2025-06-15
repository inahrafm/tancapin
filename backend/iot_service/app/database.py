# iot_service/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Mengambil URL database dari environment variables yang kita set di docker-compose
# Format: postgresql://user:password@host/database
# Host 'db' adalah nama service database di docker-compose.yml
DATABASE_URL = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}"
    f"@db/{os.getenv('POSTGRES_DB')}"
)

# Membuat "mesin" yang akan terhubung ke database
engine = create_engine(DATABASE_URL)

# Membuat sebuah "pabrik sesi" untuk berkomunikasi dengan database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class yang akan digunakan oleh model-model data kita
Base = declarative_base()