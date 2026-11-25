# План — Minecraft-site (від 25.11.2026)

## Де ми зараз
- ✅ Домен metlab.pp.ua — мій, Cloudflare, Active
- ✅ Тунель Core-minecraft → core-back.metlab.pp.ua → бекенд (Swagger працює)
- ✅ Docker: бекапи серверів, Watchtower, RCON
- ⏳ Бекенд на сервері — СТАРИЙ образ (05.11), новий ще не випущено
- ⏳ Сайт — ще на домені брата (minecraft.my-work.pp.ua)

---

## Блок 1. Чому зависає робочий ноут (необов'язково)

- [ ] Диспетчер завдань (Ctrl+Shift+Esc) → вкладка «Продуктивність»:
      що на 100% під час зависання — ЦП, Пам'ять чи Диск?
- [ ] Якщо Диск 100% → найімовірніше старий HDD.
      Рішення: SSD (найбільший приріст швидкості для старих ноутбуків)
- [ ] Якщо Пам'ять → закрити зайве, перевірити автозапуск
      (Диспетчер → «Автозавантаження» → вимкнути непотрібне)
- [ ] Якщо ЦП + ноут гарячий → чистка від пилу, заміна термопасти
- [ ] Антивірус: повна перевірка один раз, потім подивитись,
      чи він сам не вантажить систему

---

## Блок 2. Сайт на мій домен

- [ ] Cloudflare → Workers & Pages → знайти проєкт minecraft-site
- [ ] Перевірити: проєкт у ТОМУ Ж акаунті, що й metlab.pp.ua?
      (якщо ні — напишу, як перенести)
- [ ] Проєкт → Custom domains → Set up a custom domain → metlab.pp.ua
- [ ] Почекати кілька хвилин → відкрити https://metlab.pp.ua
      Сайт відкривається, але API поки "помилка з'єднання" — це нормально,
      URL змінимо в блоці 3

---

## Блок 3. Міняємо URL + перший реліз

### 3.1. Підготувати комп'ютер (якщо VS Code / Python видалені)
- [ ] Встановити VS Code
- [ ] Встановити Python 3.15 з python.org (звичайний інсталятор,
      галочка «Add to PATH»)
- [ ] git clone https://github.com/MetenBouldry/Minecraft-site D:\Project\Minecraft-site
- [ ] git checkout refactor/split-js
- [ ] cd src\backend → python -m venv .venv → .venv\Scripts\Activate.ps1
- [ ] pip install -r requirements.txt
- [ ] Покласти .env (SECRET_KEY) у src\backend — завантажити з сервера
      через filebrowser (site/src/backend/.env)

### 3.2. Бекенд
- [ ] requirements.txt → UTF-8:
      Set-Content -Encoding ascii requirements.txt (Get-Content requirements.txt)
- [ ] main.py → allow_origins → додати "https://metlab.pp.ua"
- [ ] Запустити локально: uvicorn app.main:app --reload → без помилок

### 3.3. База — ПЕРЕД релізом!
- [ ] filebrowser: порівняти дати site/src/backend/test.db і site/src/data/app.db
- [ ] Якщо test.db новіша → скопіювати в site/src/data/ і перейменувати на app.db
- [ ] Завантажити копію app.db собі (про всяк випадок)

### 3.4. Реліз
- [ ] git add . → git commit → git push
- [ ] git tag v1.1.0 → git push origin v1.1.0
- [ ] GitHub → Actions → зелена галочка
- [ ] ~5 хв → Portainer: логи watchtower (оновив?) і minecraft_site_backend
- [ ] https://core-back.metlab.pp.ua/docs → Swagger з НОВИМИ роутами

### 3.5. Фронтенд
- [ ] core.js → API_ORIGIN = 'https://core-back.metlab.pp.ua'
- [ ] script.js (старий, у main) → Ctrl+H: minemine.my-work.pp.ua → core-back.metlab.pp.ua
      (4 місця)
- [ ] Задеплоїти сайт
- [ ] https://metlab.pp.ua → вхід, профіль, аватарка, статус серверів

### 3.6. Прибирання
- [ ] Тунель Core-minecraft → видалити маршрут minemine.my-work.pp.ua
- [ ] Попросити брата видалити в ЙОГО DNS записи minemine і minecraft

---

## Блок 4. Пишемо ядро далі

Кожен пункт — окремий день, якщо треба. Код — у чаті з Claude.

- [ ] 4.1. users.py — правила ролей + роут GET /roles
- [ ] 4.2. mc_server.py (дописати) + stats.py на нього
- [ ] 4.3. routes/logs.py — журнал наживо + завантаження файлів
- [ ] 4.4. rcon.py + routes/console.py — консоль серверів (admin/owner)
- [ ] 4.5. main.py — підключити logs і console

### Перевірка через Swagger (коли все ядро готове)
Реліз v1.2.0 → https://core-back.metlab.pp.ua/docs

| Під ким   | Запит                                   | Очікування           |
|-----------|-----------------------------------------|----------------------|
| owner     | GET /api/roles                          | user, moderator, admin |
| admin     | GET /api/roles                          | user, moderator      |
| admin     | PATCH роль owner → user                 | 403                  |
| user      | GET /api/logs/vanilla                   | 403                  |
| moderator | GET /api/logs/vanilla/live              | рядки журналу        |
| moderator | POST /api/console/vanilla               | 403                  |
| admin     | POST /api/console/vanilla {"command":"list"} | список гравців  |
| admin     | POST ... {"command":"stop"}             | 403 (лише owner)     |

---

## Пізніше
- Фронтенд: admin.js (список ролей), logs.html + logs.js (журнал і консоль)
- Автоматичні тести (pytest + ruff) у GitHub Actions
- Модпак TFG з GitHub (TFG_VERSION) — окремим днем, з бекапом світу