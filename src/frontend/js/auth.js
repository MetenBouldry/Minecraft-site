// ═══════════════════════════════════════════════════════════
//    AUTH.JS — вхід, реєстрація, відновлення пароля
//    Сторінки: register.html, login.html, forgot-password.html
//    Потребує: core.js (API_BASE_URL, t, showToast, getErrorMessage,
//              getInputValue, readJson)
// ═══════════════════════════════════════════════════════════

// Затримка перед переходом на іншу сторінку (щоб встигнути прочитати тост)
const REDIRECT_DELAY = 1500;

// ─────────────────────────────────────────────
//  1. РЕЄСТРАЦІЯ (register.html)
// ─────────────────────────────────────────────
// Знаходимо форму реєстрації (якщо ми на сторінці register.html)
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Зупиняємо перезавантаження сторінки

        // Беремо значення з полів (пароль НЕ обрізаємо — пробіли можуть бути його частиною)
        const username = getInputValue('username').trim();
        const email = getInputValue('email').trim();
        const password = getInputValue('password');

        try {
            // Відправляємо POST-запит на бекенд (JSON)
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username, email, password})
            });
            const data = await readJson(response);

            if (response.ok) {
                // Успіх — показуємо повідомлення і переходимо на логін
                showToast(t('alert.reg_success', 'Реєстрація успішна!'), 'success');
                setTimeout(() => {window.location.href = 'login.html'; }, REDIRECT_DELAY);
            } else if (response.status === 429) {
                showToast(t('alert.too_many_requests', 'Забагато спроб. Спробуйте за хвилину.'), 'error');
            } else {
                const message = getErrorMessage(data, t('alert.unknown_error', 'Невідома помилка'));
                showToast(t('alert.reg_error', 'Помилка реєстрації') + ': ' + message, 'error');
            }
        } catch (error) {
            // Помилка з'єднання (сервер не запущений)
            console.error(error);
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
        }
    });
}

// ─────────────────────────────────────────────
//  2. ВХІД (login.html)
// ─────────────────────────────────────────────

// Знаходимо форму входу (якщо ми на сторінці login.html)
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = getInputValue('loginUsername').trim();
        const password = getInputValue('loginPassword');

        try {
            // Бекенд чекає form-data (стандарт OAuth2), а не JSON
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({username, password})
            });
            const data = await readJson(response);

            if (response.ok) {
                // Успіх — зберігаємо токен у localStorage
                localStorage.setItem('token', data.access_token);
                window.location.href = '../index.html';
            } else if (response.status === 429) {
                showToast(t('alert.too_many_requests', 'Забагато спроб. Спробуйте за хвилину.'), 'error');
            } else{
                // Помилка — показуємо текст з сервера
                showToast(t('alert.login_error', 'Невірний логін або пароль'), 'error');
            }
        } catch (error) {
            console.error(error);
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
        }
    });
}

// ─────────────────────────────────────────────
//  3. ВІДНОВЛЕННЯ ПАРОЛЯ (forgot-password.html)
// ─────────────────────────────────────────────
const forgotForm = document.getElementById('forgotForm');
const resetForm = document.getElementById('resetForm');

if (forgotForm && resetForm) {
    // Крок 1: Запит токена (введення Email)
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = getInputValue('resetEmail').trim();

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await readJson(response);

            if (response.ok) {
                // Повідомлення, що токен створено
                const msg = document.getElementById('forgotMessage');
                if (msg) {
                    msg.textContent = t('alert.token_created', 'Токен створено! Перевірте логи Docker (Portainer).');
                    msg.style.display = 'block';
                }
                

                // Показуємо другу форму для введення токена
                resetForm.style.display = 'flex';
            } else if (response.status ===429) {
                showToast(t('alert.too_many_requests', 'Забагато спроб. Спробуйте за хвилину.'), 'error');
            } else {
                showToast(getErrorMessage(data, t('alert.error', 'Помилка')), 'error');
            }
        } catch (err) {
            console.error(err);
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
        }
    });

    // ── Крок 2: новий пароль (токен + пароль) ──
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = getInputValue('resetToken').trim();
        const new_password = getInputValue('newPasswordReset');

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password})
            });
            const data = await readJson(response);

            if (response.ok) {
                showToast(t('alert.success_password1','Пароль успішно змінено! Тепер можете увійти.'), 'success');
                setTimeout(() => {window.location.href = 'login.html';}, REDIRECT_DELAY);
            } else {
                showToast(getErrorMessage(data, t('alert.change_password_error', 'Помилка зміни паролю')), 'error');
            }
        } catch (err) {
            console.error(err);
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
        }
    });    
}
