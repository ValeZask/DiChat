from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.computer import Computer
from app.schemas.computer import ComputerMe
from app.utils import get_client_ip
from fastapi import Request

router = APIRouter()

@router.get("/me", response_model=ComputerMe)
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    ip = get_client_ip(request)
    
    result = await db.execute(
        select(Computer).where(Computer.ip == ip)
    )
    computer = result.scalar_one_or_none()
    
    if computer is None:
        raise HTTPException(
            status_code=404,
            detail=f"Computer with IP {ip} not found. Contact your administrator."
        )
    
    return computer