from sqlalchemy import Boolean, Column, Integer, String
from app.models.base import Base


class Computer(Base):
    __tablename__ = "computers"

    id        = Column(Integer, primary_key=True, index=True)
    ip        = Column(String(15), unique=True, nullable=False, index=True)
    name      = Column(String(50), nullable=False)
    classroom = Column(String(1),  nullable=False)   # "A" | "B"
    is_admin  = Column(Boolean, default=False, nullable=False)