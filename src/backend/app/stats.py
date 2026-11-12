import os
import json
from fastapi import APIRouter, HTTPException
from typing import Any

router = APIRouter

# Базова папка, куди ми підключили /data/minecraft
BASE_MC_PATH = "/app/mc-servers"

def get_username(uuid: str, server_data_path: str) -> str:
    """Шукає ім'я гравця у конкретному usercache.json для цього сервера."""
    usercache_path = os.path.join(server_data_path, "usercache.json")

    try:
        if os.path.exists(usercache_path):
            with open(usercache_path, 'r', encoding='utf-8') as f:
                users = json.load(f)
                for user in users:
                    # Порівнюємо UUID без дефісів (для надійності)
                    if user.get("uuid", "").replace("-", "") == uuid.replace("-", ""):
                        return user.get("name", uuid)
    except Exception as e:
        print(f"Помилка читання usercache для {server_data_path}: {e}")

    return uuid # Якщо не знайшли — повертаємо UUID