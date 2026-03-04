from sqlalchemy import Column, Integer, String
from app.database import Base

class Room(Base):
    __tablename__ = 'rooms'
    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String(100), nullable=True)  # ← добавили
    type      = Column(String(10), nullable=False)
    classroom = Column(String(1),  nullable=True)