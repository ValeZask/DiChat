from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.computer import Computer
from app.schemas.computer import ComputerMe
from app.utils import get_client_ip
from typing import List

router = APIRouter()

@router.get("/me", response_model=ComputerMe)
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    ip = get_client_ip(request)

    result = await db.execute(select(Computer).where(Computer.ip == ip))
    computer = result.scalar_one_or_none()

    if computer is None:
        raise HTTPException(
            status_code=404,
            detail=f"Computer with IP {ip} not found. Contact your administrator."
        )

    return computer


@router.get("/classmates", response_model=List[ComputerMe])
async def get_classmates(request: Request, db: AsyncSession = Depends(get_db)):
    """Возвращает все компы того же класса, кроме себя и админов."""
    ip = get_client_ip(request)

    result = await db.execute(select(Computer).where(Computer.ip == ip))
    computer = result.scalar_one_or_none()

    if computer is None:
        raise HTTPException(status_code=404, detail=f"Computer with IP {ip} not found.")

    result = await db.execute(
        select(Computer).where(
            Computer.classroom == computer.classroom,
            Computer.ip != computer.ip,
            Computer.is_admin == False,
        ).order_by(Computer.name)
    )

    return result.scalars().all()