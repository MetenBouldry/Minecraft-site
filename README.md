# ⛏️ Minecraft-site

Мій перший проєкт. Я вчуся на ньому програмувати.

Мета — зробити сайт із власним backend для моїх Minecraft-серверів (TerraFirmaGreg і Vanilla), щоб гравцям було зручно дивитися статистику, карту й стан серверів в одному місці.

> 🚧 Проєкт у розробці. Щось може не працювати або змінюватися.

## ✨ Що вже є

- Статус серверів (онлайн / офлайн)
- Статистика гравців: час у грі, вбивства мобів, смерті, пройдена відстань
- Реєстрація, вхід, особистий кабінет з аватаркою
- Ролі: користувач, адмін, власник
- Українська та англійська мови

## 🗺️ Плани

- [ ] Карта серверів
- [ ] Тести
- [ ] Відновлення пароля через email

## 🛠️ Технології

**Frontend:** HTML, CSS, JavaScript
**Backend:** Python, FastAPI, SQLAlchemy, SQLite
**Деплой:** Docker, GitHub Actions, Portainer

## 🚀 Запуск

**Frontend:** відкрий `src/frontend/index.html` через Live Server у VS Code.

**Backend:**

```bash
cd src/backend
pip install -r requirements.txt
# створи файл .env з рядком SECRET_KEY=будь-який_довгий_рядок
uvicorn app.main:app --reload
```

Документація API буде за адресою http://localhost:8000/docs

## 📚 Нотатки

У теці `docs/` лежать мої навчальні нотатки про HTML, CSS, JavaScript і перемикання мов.

## 📄 Ліцензія

[MIT](LICENSE)