from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id         = Column(Integer, primary_key=True, index=True)
    room_id    = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    from_ip    = Column(String(15), ForeignKey("computers.ip", ondelete="SET NULL"), nullable=True)
    text       = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    room     = relationship("Room")
    computer = relationship("Computer", foreign_keys=[from_ip])