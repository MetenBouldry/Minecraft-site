import sqlite3
import os

# Шлях до бази даних (відносно папки app)
DB_PATH = "test.db"

def add_column_if_not_exist(cursor, table, column, col_type):
    """Перевіряє, чи існує колонка, і якщо ні — додає її."""
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [info[1] for info in cursor.fetchall()]

    if column not in columns:
        print(f"⏳ Додаємо колонку '{column}' у таблицю '{table}'...")
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        print(f"✅ Колонку '{column}' успішно додано!")
    else:
        print(f"ℹ️ Колонка '{column}' вже існує. Пропуск.")

def run_migrations():
    if not os.path.exists(DB_PATH):
        print("ℹ️ База даних ще не створена. Вона створиться автоматично при першому запуску.")
        return

    print("🔄 Перевірка оновлень бази даних...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # ═══════ ТУТ ПЕРЕЛІЧУЙТЕ ВСІ НОВІ КОЛОНКИ, ЯКІ ДОДАЄТЕ ═══════
    # Формат: add_column_if_not_exists(cursor, "назва_таблиці", "назва_колонки", "тип")

    add_column_if_not_exist(cursor, "users", "avatar_url", "VARCHAR")
    add_column_if_not_exist(cursor, "users", "reset_token", "VARCHAR")

    # Якщо завтра додаси нову колонку, просто допиши сюди ще один рядок:
    # add_column_if_not_exists(cursor, "users", "bio", "TEXT")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    run_migrations()