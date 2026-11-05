from fastapi import APIRouter
import socket

router = APIRouter()

@router.get("/status/{server_name}")
def check_status(server_name: str):
    # Імена контейнерів з твого docker-compose.yml
    servers = {
        "terrafirmagreg": "terragreg",
        "vanilla": "vanilla"
    }

    host = servers.get(server_name.lower())
    if not host:
        return {"online": False, "error": "Unknown server"}

    try:
        # Підключення до стандартного порту Minecraft
        with socket.create_connection((host, 25565), timeout=2):
            return {"online": True}
    except Exception:
        return {"online": False}       