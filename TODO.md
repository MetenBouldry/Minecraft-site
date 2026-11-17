# TODO — Minecraft-site (огляд від 15.11.2026, коміт 02d3fb9)

## 🔴 1. Критичне
- [x] schemas.py:7 — PasswordType скопійовано з UsernameType.
      Замінити на: Annotated[str, Field(min_length=8, max_length=128)]
- [x] schemas.py:42 — PasswordResetConfirm.new_password: str → PasswordType
- [x] schemas.py:1 — видалити зайвий `from dataclasses import field`
- [x] users.py:53-54 — прибрати ручну перевірку len < 8 (тепер її робить схема)

## 🟠 2. Важливе
- [x] server.py — `except (socket.timeout, ConnectionRefusedError, socket.gaierror)` → `except OSError`
- [x] main.py — зареєструвати slowapi:
      app.state.limiter = limiter
      app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
- [x] Справжній IP за проксі: uvicorn --proxy-headers --forwarded-allow-ips="*"
      (або CF-Connecting-IP у key_func, якщо за Cloudflare)
- [x] Ліміт також на /register і /forgot-password
- [x] script.js:163 — querySelectorAll('.lang-toggle') → querySelector('.lang-toggle')
- [x] build.yaml:15 — self-hosted runner у публічному репо: зробити репо приватним
      або Settings → Actions → вимагати approval для зовнішніх PR
- [x] build.yaml:68 — прибрати `-k` з curl
- [ ] Portainer: volumes на /app/data (БД) і /app/uploads (аватарки).
      Перевірити: після redeploy користувачі й аватарки на місці
- [x] requirements.txt: fastapi>=0.115.6, python-multipart>=0.0.18,
      python-jose → PyJWT

## 🟡 3. Дрібниці
- [ ] auth.py — int(str(user_id)): обгорнути в try/except ValueError → 401
- [ ] Токен скидання пароля зберігати як хеш, не відкритим текстом
- [ ] users.py:74 — обмежити розмір upload у проксі (client_max_body_size 2m)
- [ ] register: ловити IntegrityError (одночасна реєстрація) → 400 замість 500
- [ ] script.js: одна константа API_URL замість API_URL + API_BASE_URL,
      домен minemine.my-work.pp.ua не повторювати 4 рази
- [ ] showToast: textContent замість innerHTML; обробляти detail-масив від Pydantic
- [ ] models.py:18 — Mapped[Optional[datetime]] (з модуля datetime), не DateTime
- [ ] migrate.py — DB_PATH не працює з абсолютним шляхом sqlite:////...
- [ ] README: прибрати Passlib і «вхід — у процесі»
- [ ] Прибрати зайві str() / # type: ignore, додані лише заради PyCharm

## 🧪 4. Тести (pytest + TestClient)
- [ ] Реєстрація: короткий пароль → 422, пароль зі спецсимволами → 200
- [ ] /me: без токена → 401, з токеном → 200
- [ ] /users: user → 403, admin → 200
- [ ] Зміна ролі: admin змінює роль owner → 403, змінює свою → 400
- [ ] Видалення: owner видаляє user → 200, admin → 403, owner себе → 400

## 💻 5. Середовище (слабкі ПК)
- [ ] VS Code: "python.analysis.typeCheckingMode": "basic" (Pylance)
- [ ] Розширення Ruff (charliermarsh.ruff)
- [ ] PyCharm лише для разових перевірок