from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.core.database import Base

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    text_snippet = Column(String(255))
    score = Column(Integer)
    level = Column(String(32))
    matches_count = Column(Integer)
    processing_time_ms = Column(Float)
