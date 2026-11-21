# ═══════ РОЛІ ТА ЇХНІ РІВНІ ═══════
# Чим більше число — тим більше прав.
# Щоб додати роль — допиши рядок сюди (і в ASSIGNABLE_ROLES, якщо її можна видавати).

ROLE_LEVELS: dict[str, int] = {
    "user": 0,
    "moderator": 1,
    "admin": 2,
    "owner": 3,
}

# Ролі, які можна призначати через API (owner — ні, він один і задається вручну)
ASSIGNABLE_ROLES: list[str] = ["user", "moderator", "admin"]

def role_level(role: str) -> int:
    """Рівень ролі. Невідома роль = найнижчий рівень."""
    return ROLE_LEVELS.get(role, 0)