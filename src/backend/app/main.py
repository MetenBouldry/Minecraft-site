from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .routes import auth, users

#Створюємо таблицю в БД(якщо немає)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Minecraft site API")

# CORS(щоб фронт міг робити запити)
app.add_middleware(
    CORSMiddleware, # type: ignore
    allow_origins=["*"], # type: ignore
    allow_credentials=True, # type: ignore
    allow_methods=["*"], # type: ignore
    allow_headers=["*"] # type: ignore
)

# Підключення маршруту
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(users.router, prefix="/api", tags=["User"])

@app.get("/")
def root():
    return {"message": "API is running"}