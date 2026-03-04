from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.computer import Computer
from app.models.room import Room
from app.schemas.room import RoomOut
from app.utils import get_client_ip
from fastapi import Request
from typing import List

router = APIRouter()

@router.get("/rooms", response_model=List[RoomOut])
async def get_rooms(request: Request, db: AsyncSession = Depends(get_db)):
    ip = get_client_ip(request)

    # Определяем текущего пользователя
    result = await db.execute(select(Computer).where(Computer.ip == ip))
    computer = result.scalar_one_or_none()

    if computer is None:
        raise HTTPException(status_code=404, detail=f"Computer with IP {ip} not found.")

    # Админ видит все комнаты
    if computer.is_admin:
        result = await db.execute(select(Room))
    else:
        # Ученик видит только комнаты своего класса
        result = await db.execute(
            select(Room).where(Room.classroom == computer.classroom)
        )

    rooms = result.scalars().all()
    return rooms