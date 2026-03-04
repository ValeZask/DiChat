from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.computer import Computer
from app.models.room import Room
from app.schemas.computer import ComputerMe
from app.schemas.room import RoomOut
from app.utils import get_client_ip

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(request: Request, db: AsyncSession = Depends(get_db)) -> Computer:
    ip = get_client_ip(request)
    result = await db.execute(select(Computer).where(Computer.ip == ip))
    computer = result.scalar_one_or_none()
    if computer is None or not computer.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return computer


# --- Схема для создания компа ---
from pydantic import BaseModel

class ComputerCreate(BaseModel):
    ip: str
    name: str
    classroom: str
    is_admin: bool = False


# --- Эндпоинты ---

@router.get("/rooms", response_model=List[RoomOut])
async def admin_get_rooms(
    db: AsyncSession = Depends(get_db),
    _: Computer = Depends(require_admin),
):
    result = await db.execute(select(Room))
    return result.scalars().all()


@router.get("/computers", response_model=List[ComputerMe])
async def admin_get_computers(
    db: AsyncSession = Depends(get_db),
    _: Computer = Depends(require_admin),
):
    result = await db.execute(select(Computer))
    return result.scalars().all()


@router.post("/computers", response_model=ComputerMe, status_code=201)
async def admin_create_computer(
    data: ComputerCreate,
    db: AsyncSession = Depends(get_db),
    _: Computer = Depends(require_admin),
):
    # Проверяем что IP не занят
    result = await db.execute(select(Computer).where(Computer.ip == data.ip))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"IP {data.ip} already exists.")

    computer = Computer(**data.model_dump())
    db.add(computer)
    await db.commit()
    await db.refresh(computer)
    return computer


@router.delete("/computers/{computer_id}", status_code=204)
async def admin_delete_computer(
    computer_id: int,
    db: AsyncSession = Depends(get_db),
    _: Computer = Depends(require_admin),
):
    result = await db.execute(select(Computer).where(Computer.id == computer_id))
    computer = result.scalar_one_or_none()
    if computer is None:
        raise HTTPException(status_code=404, detail="Computer not found.")

    await db.delete(computer)
    await db.commit()