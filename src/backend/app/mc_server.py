import os

# Тека, куди в Docker змонтовано дані Minecraft-серверів
BASE_MC_PATH = "/app/mc-servers"

# Назва сервера в API → тека на диску і ім'я контейнера в мережі Docker.
# Новий сервер = новий рядок тут
MC_SERVERS: dict[str, dict[str, str]] = {
    "terrafirmagreg": {"folder": "server1", "host": "terragreg"},
    "vanilla": {"folder": "server2", "host": "vanilla"},
}

def get_server_data_path(server_name: str) -> str | None:
    """Шлях до теки data сервера, або None, якщо такого сервера немає."""
    server = MC_SERVERS.get(server_name.lower())
    if not server:
        return None

    base_path = os.getenv("MC_SERVERS_PATH", BASE_MC_PATH)
    return os.path.join(base_path, server["folder"], "data")

def get_server_host(server_name: str) -> str | None:
    """Ім'я контейнера сервера в мережі Docker, або None."""
    server = MC_SERVERS.get(server_name.lower())
    return server["host"] if server else None