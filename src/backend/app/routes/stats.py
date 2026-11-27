import json
import os
from json import JSONDecodeError
from typing import Any

from fastapi import APIRouter, HTTPException

from ..mc_server import get_server_data_path

router = APIRouter()

def get_username(uuid: str, server_data_path: str) -> str:
    """Шукає ім'я гравця у конкретному usercache.json для цього сервера."""
    usercache_path = os.path.join(server_data_path, "usercache.json")

    try:
        if os.path.exists(usercache_path):
            with open(usercache_path, encoding='utf-8') as f:
                users = json.load(f)
                for user in users:
                    # Порівнюємо UUID без дефісів (для надійності)
                    if user.get("uuid", "").replace("-", "") == uuid.replace("-", ""):
                        return user.get("name", uuid)
    except (OSError, JSONDecodeError) as e:
        print(f"Помилка читання usercache.json: {e}")

    return uuid # Якщо не знайшли — повертаємо UUID

@router.get("/stats/players/{server_name}")
def get_players_stats(server_name: str) -> list[dict[str, Any]]:
    server_data_path = get_server_data_path(server_name)
    if not server_data_path:
        raise HTTPException(status_code=404, detail="Сервер не знайдено")

    stats_dir = os.path.join(server_data_path, "word", "stats")

    if not os.path.exists(stats_dir):
        raise HTTPException(status_code=404, detail="Папка статистики не знайдена")

    players = []
    for filename in os.listdir(stats_dir):
        if filename.endswith(".json"):
            uuid = filename.replace(".json", "")
            filepath = os.path.join(stats_dir, filename)
            try:
                with open(filepath, encoding='utf-8') as f:
                    data = json.load(f)
                    custom_stats = data.get("stats", {}).get("minecraft:custom", {})
                    killed_stats = data.get("stats", {}).get("minecraft:killed", {})

                    play_time_ticks = custom_stats.get("minecraft:play_time", 0)
                    players.append({
                        "name": get_username(uuid, server_data_path),
                        "play_time_hours": round(play_time_ticks / 20 / 60 / 60, 1),
                        "mob_kills":sum(killed_stats.values()),
                        "deaths": custom_stats.get("minecraft:deaths", 0),
                        "walk_km": round(custom_stats.get("minecraft:walk_one_cm", 0) / 100000, 1),
                        "jumps": custom_stats.get("minecraft:jump", 0)
                    })
            except (OSError, JSONDecodeError) as e:
                print(f"Помилка читання {filename}: {e}")

    players.sort(key=lambda x: x["play_time_hours"], reverse=True)
    return players