from sqlalchemy import Column, Integer, String
from app.models.base import Base


class Room(Base):
    __tablename__ = "rooms"

    id        = Column(Integer, primary_key=True, index=True)
    type      = Column(String(10), nullable=False)  # "group" | "private"
    classroom = Column(String(1),  nullable=True)   # NULL для приватных комнат