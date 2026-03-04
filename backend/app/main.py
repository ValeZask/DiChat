from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.me import router as me_router
from app.routers.rooms import router as rooms_router

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

@app.get("/")
async def root():
    return {"status": "ok", "message": "DiChat02 backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}