from pydantic import BaseModel

class ComputerMe(BaseModel):
    ip: str
    name: str
    classroom: str
    is_admin: bool

    class Config:
        from_attributes = True