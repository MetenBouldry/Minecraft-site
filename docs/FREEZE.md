# Проєкт заморожено — 24.11.2026

## Де що
- Код: GitHub, гілка `refactor/split-js` (найновіше), `main` — стабільна
- База сайту: сервер `/data/minecraft/site/src/data/app.db` + копія на ПК
- Світи: `/data/minecraft/server1`, `server2` + бекапи в `.../backups`

## Стан
- Бекенд: зроблено roles.py + require_role. Далі: users.py (ролі), журнал, консоль
- requirements.txt: 9 рядків, зберегти в UTF-8 (не UTF-16!)
- Реліз: тег v1.1.0 ще не створено
- Cloudflare: видалено. Тунель має бути в ТОМУ Ж акаунті, що й домен (акаунт брата)

## Як повернутися
1. Відкрити D:\Project\Minecraft-site (одна тека, не PyCharmProjects)
2. .venv\Scripts\Activate.ps1 → uvicorn app.main:app --reload
3. Продовжити з users.py