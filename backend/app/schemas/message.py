from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageOut(BaseModel):
    id: int
    room_id: int
    from_ip: Optional[str] = None
    sender_name: Optional[str] = None  # имя компа, удобнее чем IP
    text: str
    created_at: datetime

    class Config:
        from_attributes = True