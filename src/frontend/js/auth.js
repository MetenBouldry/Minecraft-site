// ─────────────────────────────────────────────
//  3.1. РЕЄСТРАЦІЯ
// ─────────────────────────────────────────────

// Знаходимо форму реєстрації (якщо ми на сторінці register.html)
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Зупиняємо перезавантаження сторінки

        // Беремо значення з полів
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Відправляємо POST-запит на бекенд (JSON)
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username, email, password})
            });

            const data =await response.json();

            if (response.ok) {
                // Успіх — показуємо повідомлення і переходимо на логін
                showToast(t('alert.reg_success', 'Реєстрація успішна!'), 'success');
                window.location.href = 'login.html';
            } else {
                // Помилка — показуємо текст з сервера
                showToast(t('alert.reg_error', 'Помилка') + ': ' + (data.detail || t('alert.unknown_error', 'Невідома помилка')), 'error');
            }
        } catch (error) {
            // Помилка з'єднання (сервер не запущений)
            console.error(error);
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');

        }
    });
}

// ─────────────────────────────────────────────
//  3.2. ВХІД (ЛОГІН)
// ─────────────────────────────────────────────

// Знаходимо форму входу (якщо ми на сторінці login.html)
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Відправляємо POST-запит на бекенд (form-data)
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({username, password})
            });

            const data = await response.json();

            if (response.ok) {
                // Успіх — зберігаємо токен у localStorage
                localStorage.setItem('token', data.access_token);
                // alert(t('login-success', 'Вхід успішний!'));
                window.location.href = '../index.html';
            } else {
                // Помилка — показуємо текст з сервера
                showToast(t('alert.login_error', 'Невірний логін або пароль'), 'error');
            }
        } catch (error) {
            console.error(error);
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
        }
    });
}

// ═══════════════════════════════════════════════════════════
//    7. ВІДНОВЛЕННЯ ПАРОЛЮ
// ═══════════════════════════════════════════════════════════

const forgotForm = document.getElementById('forgotForm');
const resetForm = document.getElementById('resetForm');

if (forgotForm) {
    // Крок 1: Запит токена (введення Email)
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                // Показуємо повідомлення, що токен створено
                const msg = document.getElementById('forgotMessage');
                msg.textContent = "Токен створено! Перевірте логи Docker (Portainer).";
                msg.style.display = 'block';

                // Показуємо другу форму для введення токена
                resetForm.style.display = 'flex';
            } else {
                showToast(data.detail || t('alert.error', 'Помилка'), 'error');
            }
        } catch (err) {
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
        }
    });

    // Крок 2: Зміна паролю (введення токена та нового паролю)
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('resetToken').value;
        const new_password = document.getElementById('newPasswordReset').value;

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password})
            });
            const data = await response.json();

            if (response.ok) {
                showToast(t('alert.success_password1','Пароль успішно змінено! Тепер можете увійти.'), 'success');
                window.location.href = 'login.html';
            } else {
                showToast(data.detail || t('alert.change_password_error', 'Помилка зміни паролю'), 'error');
            }
        } catch (err) {
            showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
        }
    });
        
    
}

// Закрити меню при кліку на будь-яке посилання в ньому
document.querySelectorAll('.lang-menu button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('langMenu').classList.remove('show');
    });
});