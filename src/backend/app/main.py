import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from .migrate import run_migrations
from .database import engine
from .models import Base
from .routes import auth, users, server, stats

# ═══════ ВИКЛИК МІГРАЦІЇ ═══════
run_migrations()
#Створюємо таблицю в БД(якщо немає)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Minecraft site API")

# Створюємо папку uploads, якщо її немає (це вирішує баг)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS(щоб фронт міг робити запити)
app.add_middleware(
    CORSMiddleware, # type: ignore
    allow_origins=[
        "http://localhost:63342",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://minecraft.my-work.pp.ua",  
        "https://minecraft-site-ac7.pages.dev"
    ], # type: ignore
    allow_credentials=True, # type: ignore
    allow_methods=["*"], # type: ignore
    allow_headers=["*"] # type: ignore
)

# Підключення маршруту
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(users.router, prefix="/api", tags=["User"])
app.include_router(server.router, prefix="/api", tags=["Server"])
app.include_router(stats.router, prefix="/api", tags=["Stats"])

@app.get("/")
def root():
    return {"message": "API is running"}