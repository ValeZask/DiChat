from pydantic import BaseModel
from typing import Optional

class RoomOut(BaseModel):
    id: int
    name: Optional[str] = None
    type: str
    classroom: Optional[str] = None

    class Config:
        from_attributes = True