from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .routes import auth, users

#Створюємо таблицю в БД(якщо немає)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Minecraft site API")

# CORS(щоб фронт міг робити запити)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Підключення маршруту
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(users.router, prefix="/api", tags=["User"])

@app.get("/")
def root():
    return {"message": "API is running"}