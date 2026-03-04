from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.models.computer import Computer
from app.models.message import Message
from app.models.room import Room
from app.schemas.message import MessageOut
from app.utils import get_client_ip
from fastapi import Request

router = APIRouter()

@router.get("/messages/{room_id}", response_model=List[MessageOut])
async def get_messages(
    room_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
):
    ip = get_client_ip(request)

    # Проверяем пользователя
    result = await db.execute(select(Computer).where(Computer.ip == ip))
    computer = result.scalar_one_or_none()
    if computer is None:
        raise HTTPException(status_code=404, detail=f"Computer with IP {ip} not found.")

    # Проверяем что комната существует
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Ученик не может читать чужой класс
    if not computer.is_admin and room.classroom != computer.classroom:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Получаем сообщения с именем отправителя
    result = await db.execute(
        select(Message, Computer.name.label("sender_name"))
        .outerjoin(Computer, Message.from_ip == Computer.ip)
        .where(Message.room_id == room_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    rows = result.all()

    # Формируем ответ (разворачиваем в хронологический порядок)
    messages = []
    for row in reversed(rows):
        msg = row[0]
        sender_name = row[1]
        messages.append(MessageOut(
            id=msg.id,
            room_id=msg.room_id,
            from_ip=msg.from_ip,
            sender_name=sender_name,
            text=msg.text,
            created_at=msg.created_at,
        ))

    return messages