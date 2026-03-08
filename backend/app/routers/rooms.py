from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.database import get_db
from app.models.computer import Computer
from app.models.room import Room
from app.schemas.room import RoomOut
from app.utils import get_client_ip
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
        result = await db.execute(select(Room).order_by(Room.type, Room.id))
        return result.scalars().all()

    # Ученик видит:
    # 1. Групповой чат своего класса
    # 2. Личные чаты где он участник (имя компа есть в названии комнаты)
    result = await db.execute(
        select(Room).where(
            or_(
                # Групповые чаты класса
                (Room.type == 'group') & (Room.classroom == computer.classroom),
                # Личные чаты где участвует этот комп
                (Room.type == 'private') & (Room.name.ilike(f'%{computer.name}%')),
            )
        ).order_by(Room.type, Room.id)  # group < private алфавитно — group первый
    )

    rooms = result.scalars().all()
    return rooms