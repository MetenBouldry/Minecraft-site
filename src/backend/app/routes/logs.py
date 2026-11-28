import os
import re
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from ..auth import require_role
from ..mc_server import get_server_data_path
from ..models import User

router = APIRouter()

# Доступ: модератор і вище
get_moderator = require_role("moderator")

# Дозволені імена файлів: latest.log, 2026-11-20-1.log.gz тощо.
# Без "/" — тому вийти за межі теки logs неможливо
LOG_NAME_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+\.log(\.gz)?$")

LATEST_LOG = "latest.log"

# Скільки байт з кінця файлу віддати при першому підключенні (~200–400 рядків)
INITIAL_BYTES = 32 * 1024

# Максимум байт за один запит
MAX_CHUNK = 256 * 1024

# ═══════ ДОПОМІЖНІ ФУНКЦІЇ ═══════

def get_logs_dir(server_name: str) -> str:
    """Тека logs сервера (або 404)."""
    data_path = get_server_data_path(server_name)
    if not data_path:
        raise HTTPException(status_code=404, detail="Сервер не знайдено")

    logs_dir = os.path.join(data_path, "logs")
    if not os.path.isdir(logs_dir):
        raise HTTPException(status_code=404, detail="Теку журналу не знайдено")
    return logs_dir

def get_log_path(server_name: str, filename: str) -> str:
    """Повний шлях до файлу журналу з перевірками безпеки."""
    if not LOG_NAME_PATTERN.fullmatch(filename):
        raise HTTPException(status_code=400, detail="Недопустиме ім'я файлу")

    logs_dir =os.path.realpath(get_logs_dir(server_name))
    path = os.path.realpath(os.path.join(logs_dir, filename))

    # Друга лінія захисту: файл має лежати саме в теці logs
    if os.path.dirname(path) != logs_dir:
        raise HTTPException(status_code=400, detail="Недопустиме ім'я файлу")

    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Файл не знайдено")
    return path

# ═══════ ШЛЯХИ ═══════
@router.get("/logs/{server_name}")
def list_logs(server_name: str, _: User = Depends(get_moderator)) -> list[dict[str, Any]]:
    logs_dir = get_logs_dir(server_name)

    files = []
    for name in os.listdir(logs_dir):
        full_path = os.path.join(logs_dir, name)
        if not LOG_NAME_PATTERN.fullmatch(name) or not os.path.isfile(full_path):
            continue

        stat = os.stat(full_path)
        files.append({
            "name": name,
            "size": stat.st_size,
            "modified": datetime.fromtimestamp(stat.st_mtime, tz=UTC).isoformat(),
        })

    # Найновіші — зверху
    files.sort(key=lambda f: f["modified"], reverse=True)
    return files

# 2. Журнал наживо: нові рядки latest.log після позиції offset
@router.get("/logs/{server_name}/live")
def live_log(
    server_name: str,
    offset: int = Query(-1, ge=1),
    _: User = Depends(get_moderator),
) -> dict[str, Any]:
    path = get_log_path(server_name, LATEST_LOG)
    size = os.path.getsize(path)

    # reset = почати заново:
    #   offset = -1   → перше підключення сторінки
    #   offset > size → сервер перезапустився, новий latest.log коротший
    reset = offset < 0 or offset > size
    start = max(0, size - INITIAL_BYTES) if reset else offset

    # Читаємо в байтах — так позиція offset завжди точна
    with open(path, "rb") as f:
        f.seek(start)
        chunk = f.read(MAX_CHUNK)

    # Почали з середини файлу — перший рядок обрізаний, пропускаємо його
    if reset and start >0:
        first_newline = chunk.find(b"\n")
        skip = first_newline + 1 if  first_newline != -1 else len[chunk]
        chunk = chunk[skip:]
        start += skip

    # Останній рядок може ще дописуватися — віддаємо лише повні рядки
    last_newline = chunk.rfind(b"\n")
    if last_newline != -1:
        chunk = chunk[: last_newline + 1]
    elif len(chunk) < MAX_CHUNK:
        chunk = b""

    text = chunk.decode("utf-8", errors="replace")
    return {
        "offcet": start + len(chunk), # звідки читати наступного разу
        "reset": reset,
        "lines": text.splitlines(),
    }

# 3. Завантаження файлу цілком (latest.log або архів .log.gz)
@router.get("/logs/{server_name}/{filename}/download")
def download_log(server_name: str, filename: str, _: User = Depends(get_moderator)) -> FileResponse:
    path = get_log_path(server_name, filename)
    media_type ="application/gzip" if filename.endswith(".gz") else "text/plain"
    return FileResponse(path,media_type=media_type, filename=f"{server_name}-{filename}")