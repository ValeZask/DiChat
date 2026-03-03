import asyncio
from app.database import engine
from app.models import Base, Computer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import select

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def seed():
    async with AsyncSessionLocal() as session:
        # Проверяем — если данные уже есть, не дублируем
        result = await session.execute(select(Computer))
        if result.scalars().first():
            print("⚠️  Данные уже есть, seed пропущен")
            return

        computers = []

        # Класс А — Комп-А1..А15, IP 192.168.1.1-15
        for i in range(1, 16):
            computers.append(Computer(
                ip=f"192.168.1.{i}",
                name=f"Комп-А{i}",
                classroom="A",
                is_admin=False,
            ))

        # Класс Б — Комп-Б1..Б15, IP 192.168.1.16-30
        for i in range(1, 16):
            computers.append(Computer(
                ip=f"192.168.1.{i + 15}",
                name=f"Комп-Б{i}",
                classroom="B",
                is_admin=False,
            ))

        # Админ
        computers.append(Computer(
            ip="127.0.0.1",
            name="Админ",
            classroom="A",  # класс не важен для админа
            is_admin=True,
        ))

        session.add_all(computers)
        await session.commit()
        print(f"✅ Добавлено {len(computers)} записей")


if __name__ == "__main__":
    asyncio.run(seed())