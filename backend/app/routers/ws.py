from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db, AsyncSessionLocal
from app.models.computer import Computer
from app.models.message import Message
from app.models.room import Room
from app.ws_manager import manager

router = APIRouter()


async def get_computer_by_ip(ip: str, db: AsyncSession):
    result = await db.execute(select(Computer).where(Computer.ip == ip))
    return result.scalar_one_or_none()


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(room_id: int, websocket: WebSocket):
    # Получаем IP клиента
    forwarded_for = websocket.headers.get("X-Forwarded-For")
    ip = forwarded_for.split(",")[0].strip() if forwarded_for else websocket.client.host

    # Проверяем пользователя и доступ к комнате
    async with AsyncSessionLocal() as db:
        computer = await get_computer_by_ip(ip, db)
        if computer is None:
            await websocket.close(code=4004, reason="Computer not found")
            return

        result = await db.execute(select(Room).where(Room.id == room_id))
        room = result.scalar_one_or_none()
        if room is None:
            await websocket.close(code=4004, reason="Room not found")
            return

        if not computer.is_admin and room.classroom != computer.classroom:
            await websocket.close(code=4003, reason="Access denied")
            return

        sender_name = computer.name

    # Подключаем к комнате
    await manager.connect(room_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            text = data.get("text", "").strip()
            if not text:
                continue

            # Сохраняем в БД
            async with AsyncSessionLocal() as db:
                message = Message(room_id=room_id, from_ip=ip, text=text)
                db.add(message)
                await db.commit()
                await db.refresh(message)

            # Рассылаем всем в комнате
            await manager.broadcast(room_id, {
                "id": message.id,
                "room_id": room_id,
                "from_ip": ip,
                "sender_name": sender_name,
                "text": text,
                "created_at": message.created_at.isoformat(),
            })

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)