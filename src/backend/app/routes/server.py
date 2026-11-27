import os
import socket

from fastapi import APIRouter

from ..mc_server import BASE_MC_PATH, MC_SERVERS, get_server_host

router = APIRouter()

@router.get("/status/{server_name}")
def check_status(server_name: str) -> dict[str, bool | str]:
    # Імена контейнерів з твого docker-compose.yml
    host = get_server_host(server_name)

    try:
        # Підключення до стандартного порту Minecraft
        with socket.create_connection((host, 25565), timeout=2):
            return {"online": True}
    except OSError:
        return {"online": False}

def get_server_data_path(server_name: str) -> str | None:
    """Шлях до теки data сервера, або None, якщо такого сервера немає."""
    server = MC_SERVERS.get(server_name.lower())
    if not server:
        return None

    # На сервері — /app/mc-servers; на ПК можна задати свою теку в .env
    base_path = os.getenv("MC_SERVERS_PATH", BASE_MC_PATH)
    return os.path.join(base_path, server["folder"], "data")