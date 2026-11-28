import os
import socket
import struct

# ═══════ RCON — протокол віддаленої консолі Minecraft ═══════
# Кожен пакет:  [довжина: 4 байти][id запиту: 4][тип: 4][текст][\x00\x00]
# Усі числа — little-endian ("<i" у struct)

RCON_PORT = 25575
TIMEOUT = 5  # сек

TYPE_COMMAND = 2  # Виконати команду
TYPE_LOGIN = 3  # Виконати вхід


class RconError(Exception):
    """Помилка RCON (невірний пароль, обрив з'єднання)."""


def _send_packet(
    sock: socket.socket, request_id: int, packet_type: int, payload: str
) -> None:
    """Збирає пакет і відправляє його серверу."""
    body = (
        struct.pack("<ii", request_id, packet_type)
        + payload.encode("utf-8")
        + b"\x00\x00"
    )
    sock.sendall(struct.pack("<i", len(body)) + body)


def _recv_exact(sock: socket.socket, size: int) -> bytes:
    """Читає рівно size байт (recv може повернути менше за раз)."""
    data = b""
    while len(data) < size:
        part = sock.recv(size - len(data))
        if not part:
            raise RconError("Сервер закрив з'єднання")
        data += part
    return data


def _read_packet(sock: socket.socket) -> tuple[int, str]:
    """Читає один пакет. Повертає (id запиту, текст)."""
    (length,) = struct.unpack("<i", _recv_exact(sock, 4))
    body = _recv_exact(sock, length)
    (request_id,) = struct.unpack("<i", body[:4])
    payload = body[8:-2].decode("utf-8", errors="replace")
    return request_id, payload


def send_command(host: str, command: str) -> str:
    """Підключається до сервера, входить паролем, виконує команду, повертає відповідь."""
    password = os.getenv("RCON_PASSWORD")
    if not password:
        raise RconError("RCON_PASSWORD не встановлений")

    with socket.create_connection((host, RCON_PORT), timeout=TIMEOUT) as sock:
        # 1. Вхід
        _send_packet(sock, 1, TYPE_LOGIN, password)
        request_id, _ = _read_packet(sock)
        if request_id == -1:
            raise RconError("Невірний пароль RCON")

        # 2. Команда
        _send_packet(sock, 2, TYPE_COMMAND, command)
        _, response = _read_packet(sock)
        return response
