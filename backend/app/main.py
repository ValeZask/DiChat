from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.me import router as me_router
from app.routers.rooms import router as rooms_router
from app.routers.messages import router as messages_router
from app.routers.ws import router as ws_router
from app.routers.admin import router as admin_router

app = FastAPI(title="DiChat02", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(me_router)
app.include_router(rooms_router)
app.include_router(messages_router)
app.include_router(ws_router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "DiChat02 backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}