// ═══════════════════════════════════════
//     ПЕРЕМИКАННЯ МОВ (без перезавантаження)
// ═══════════════════════════════════════

// Прапорці для кнопок
const FLAGS = {
    uk: 'https://flagcdn.com/24x18/ua.png',
    en: 'https://flagcdn.com/24x18/gb.png'
};

// ═══════════════════════════════════════
//     СИСТЕМА СПОВІЩЕНЬ (ТОСТИ)
// ═══════════════════════════════════════
function showToast(message, type = 'info') {
    // 1. Створюємо контейнер, якщо його ще немає
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

     // 2. Створюємо саме сповіщення
     const toast = document.createElement('div');
     toast.className = `toast ${type}`;

     // 3. Вибираємо іконку
     let icon = 'ℹ️';
     if (type === 'success') icon = '✅';
     if (type === 'error') icon = '❌';

     // 4. Наповнюємо HTML
     toast.innerHTML = `
        <span class = "toast-icon">${icon}</span>
        <span class = "toast-message">${message}</span>
        `;

        // 5. Додаємо на сторінку
        container.appendChild(toast);

        // 6. Видаляємо через 3 секунди (з анімацією)
        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000)
}

// Поточні переклади (використовуються й для підказок статусу)
let translations = {};

// Допоміжна функція: дістає значення з вкладеного об'єкта за шляхом "main.login"
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Функція t() — бере текст з JSON за ключем (тепер підтримує крапки)
// Якщо ключа немає — повертає fallback (запасний текст)
function t(key, fallback) {
    const translation = getNestedValue(translations, key);
    return translation || fallback;
}

// Функція завантаження мови
async function loadLanguage(lang) {
    try {
        const basePath = window.location.pathname.includes('/pages') ? '../' : '';
        const response = await fetch(`${basePath}lang/${lang}.json`);
        const data = await response.json();

        translations = data; // Зберігаємо для функції t()

        // Оновлюємо ВСІ елементи, які мають атрибут data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n'); // Наприклад, "main.login"
            const translation = getNestedValue(data, key);

            if (translation) {
                el.textContent = translation;
            }
        });

        // Оновлюємо елементи за ID (якщо вони є, для зворотної сумісності)
        // (Але краще використовувати тільки data-i18n)

        // Мова документа та заголовок вкладки
        document.documentElement.lang = lang;
        if (data.page && data.page.title) {
            document.title = data.page.title;
        }

        // Підказки статусу відповідно до нової мови
        refreshStatusTitles();

        // Оновлення прапорця на іконці
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            currentLangEl.innerHTML = `<img src="${FLAGS[lang]}" alt="" style="width:20px;height:15px;vertical-align:middle;">`;
        }

        // Запам'ятовування вибору
        localStorage.setItem('lang', lang);

        // Оновлення URL(без перезавантаження)
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        history.pushState({}, '', url);
    } catch (error) {
        console.error('Помилка завантаження мови', error);
    }
    
}

// Функція перемикання(викликається кнопкою)
function setLang(newLang) {
    loadLanguage(newLang).catch(err => console.error('Помилка зміни мов', err));
}

// ═══════════════════════════════════════
//     ВИЗНАЧЕННЯ МОВИ ПРИ ЗАВАНТАЖЕННІ
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    let lang;

    //1. URL
    const params = new URLSearchParams(window.location.search);
    lang = params.get('lang');

    // 2. З localstorage
    if (!lang) {
        lang = localStorage.getItem('lang');
    }

    // 3. З мови браузера
    if (!lang) {
        lang = navigator.language.startsWith('uk') ? 'uk' : 'en';
    }

    // Типово
    if (!lang || !FLAGS[lang]) {
        lang = 'uk';
    }

    loadLanguage(lang).catch(err => console.error('Помилка завантаження мови', err));
 });

 // ═══════════════════════════════════════
//     МЕНЮ ПЕРЕМИКАННЯ (шторка)
// ═══════════════════════════════════════

function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Закрити після клацання поза меню
document.addEventListener('click', (e) => {
    const menu = document.getElementById('langMenu');
    const toggle = document.querySelectorAll('.lang-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// ═════════════════════════════════════════════════════
//         ФУНКЦІЯ ПЕРЕМИКАННЯ ВИДИМОСТІ ПАРОЛЮ
// ═════════════════════════════════════════════════════

function togglePassword(inputId, iconElement) {
    const input = document.getElementById(inputId);

    if (input.type === 'password'){
        input.type = 'text';
        iconElement.textContent = '🚫'; // закрите вічко. ЗАМІНИТИ!!!!!!!
    } else {
        input.type = 'password';
        iconElement.textContent = '👁️';
    }
}

// ═══════════════════════════════════════
//         СТАТУС MINECRAFT-СЕРВЕРІВ
// ═══════════════════════════════════════

// TODO: замінити на реальні URL, коли буде backend
const API_URL ='https://minemine.my-work.pp.ua/api';

const SERVERS = [
    { name: 'terrafirmagreg', iconId: 'status-tfg' },
    { name: 'vanilla', iconId: 'status-vanilla' }
];

// Стан іконки -> ключ підказки та запасний текст
const STATUS_TITLES = {
    online:  ['status-online',  'Online'],
    offline: ['status-offline', 'Offline'],
    unknown: ['status-unknown', 'Status unavailable'],
    checking: ['status-checking', 'Checking...']
};

function setStatus(icon, state) {
    icon.classList.remove('online', 'offline', 'checking');
    if (state !== 'unknown') {
        icon.classList.add(state);
    }
    icon.dataset.state = state;
    const [key, fallback] = STATUS_TITLES[state];
    icon.title = t(key, fallback);
}

// Оновити підказки після зміни мови
function refreshStatusTitles() {
    SERVERS.forEach(({ iconId }) => {
        const icon = document.getElementById(iconId);
        if (icon && icon.dataset.state) {
            setStatus(icon, icon.dataset.state);
        }
    });
}

// Функція перевірки статусу.
// Поки backend немає (API_URL порожній) — показуємо нейтральний сірий значок,
// а не випадкові дані, щоб не вводити відвідувачів в оману.
async function checkServerStatus(serverName, iconId) {
    const icon = document.getElementById(iconId);
    if (!icon) return;

    if (!API_URL) {
        setStatus(icon, 'unknown');
        return;
    }

    setStatus(icon, 'checking');

    try {
        const response = await fetch(`${API_URL}/status/${serverName}`);
        if (!response.ok) {
            setStatus(icon, 'unknown');
            return;
        }
        const data = await response.json();
        setStatus(icon, data.online ? 'online' : 'offline');
    } catch (error) {
        console.error('Помилка перевірки статусу', error);
        setStatus(icon, 'unknown');
    }
}

function checkAllServers() {
    SERVERS.forEach(({ name, iconId }) => checkServerStatus(name, iconId));
}

// Перевірка при завантаженні
document.addEventListener('DOMContentLoaded', checkAllServers);

// Періодичне оновлення (кожні 30 сек) — лише коли є API
if (API_URL) {
    setInterval(checkAllServers, 30000);
}

// ═══════════════════════════════════════════════════════════
//    3. АВТОРИЗАЦІЯ (Підключення до API)
// ═══════════════════════════════════════════════════════════

const API_BASE_URL = 'https://minemine.my-work.pp.ua/api'; // Базова URL-адреса бекенду

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

// ─────────────────────────────────────────────
//  3.3. НАЛАШТУВАННЯ (ПРОФІЛЬ)
// ─────────────────────────────────────────────

// Знаходимо форму налаштувань (якщо ми на сторінці settings.html)
const settingsForm = document.getElementById('settingsForm');

if (settingsForm) {
    // Беремо токен з localStorage (який зберегли після входу)
    const token = localStorage.getItem('token');

    if (token) {
        // Якщо токен є — запитуємо дані користувача
        fetch(`${API_BASE_URL}/me`, {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(r => r.json())
        .then(data => {
            if (data.username) {
                // Заповнюємо поля форми
                document.getElementById('settingsUsername').value = data.username;
                document.getElementById('settingsEmail').value = data.email;
            }
        })
        .catch(error => {
            console.error('Помилка завантаження профілю:', error);
            // Якщо токен недійсний — перекидаємо на логін
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    } else {
        // Якщо токена немає — перекидаємо на логін
        window.location.href = 'login.html';
    }
}

// ═══════════════════════════════════════════════════════════
//    4. СТОРІНКА ПРОФІЛЮ (ВКЛАДКИ ТА ЛОГІКА)
// ═══════════════════════════════════════════════════════════

const profileContainer = document.querySelector('.profile-container');

if (profileContainer) {
    const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = 'login.html';
        } else {

            // ── 4.1. ПЕРЕМИКАННЯ ВКЛАДОК ──
            const navBtns = document.querySelectorAll('.nav-btn');
            const tabPanes = document.querySelectorAll('.tab-pane');

            navBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Якщо натиснули на кнопку "Адмінка" — переходимо на admin.html
                    if (btn.id === 'adminTabBtn') {
                        window.location.href = 'admin.html';
                        return;
                    }
                    // Прибираємо активний клас з усіх
                    navBtns.forEach(b => b.classList.remove('active'));
                    tabPanes.forEach(t => t.classList.remove('active'));

                    // Робимо активним натиснуте
                    btn.classList.add('active');
                    const targetId = btn.getAttribute('data-tab');
                    document.getElementById(targetId).classList.add('active');
                });
            });

            // ── 4.2. ЗАВАНТАЖЕННЯ ДАНИХ ПРОФІЛЮ (GET /me) ──
            fetch(`${API_BASE_URL}/me` , {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(async (r) => {
                if (r.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                    return null;
                }
                if (!r.ok) throw new Error('HTTP' + r.status);
                return r.json();
            })
            .then(data => {
                if (!data) return;

                // Заповнюємо поля форми
                document.getElementById('profileUsername').value = data.username || '';
                document.getElementById('profileEmail').value = data.email || '';
                document.getElementById('sidebarUsername').textContent = data.username || 'User';

                // Встановлюємо аватар (якщо є — беремо з сервера, якщо ні — заглушку)
                const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23333"/><circle cx="50" cy="40" r="15" fill="%23888"/><path d="M20 90c0-15 15-25 30-25s30 10 30 25" fill="%23888"/></svg>';
                const avatarUrl = data.avatar_url ? `https://minemine.my-work.pp.ua${data.avatar_url}`: defaultAvatar; //Переписати при переносі на хостинг

                document.getElementById('sidebarAvatar').src = avatarUrl;
                document.getElementById('mainAvatar').src = avatarUrl;

                if (data.role === 'admin') {
                    const adminTabBtn = document.getElementById('adminTabBtn');
                    if (adminTabBtn) adminTabBtn.style.display = 'block'
                }
            })
            .catch (error => console.error('Помилка завантаження профілю', error));

            // ── 4.3. ЗБЕРЕЖЕННЯ ЗАГАЛЬНИХ ДАНИХ (Username + Email) ──
            const generalForm = document.getElementById('generalForm');
            if (generalForm) {
                generalForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const username = document.getElementById('profileUsername').value.trim();
                    const email = document.getElementById('profileEmail').value.trim();

                    try {
                        const response = await fetch(`${API_BASE_URL}/me`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({username, email})
                        });
                        const data = await response.json();

                        if (response.ok) {
                            showToast(t('alert.settings_saved', 'Дані успішно оновлено!'), 'success');
                            // Оновлюємо ім'я в бічній панелі
                            document.getElementById('sidebarUsername').textContent = data.username;
                        } else {
                            showToast(data.detail || t('alert.save_error', 'Помилка збереження'), 'error');
                        }
                    } catch (err) {
                        showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
                    }
                });
            }

            // ── 4.4. ЗМІНА ПАРОЛЮ (Current + New) ──
            const securityForm = document.getElementById('securityForm');
            if (securityForm) {
                securityForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const current_password = document.getElementById('currentPassword').value;
                    const new_password = document.getElementById('newPassword').value;

                    try {
                        const response = await fetch(`${API_BASE_URL}/me`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({current_password, new_password})
                        });
                        const data = await response.json();

                        if (response.ok) {
                            showToast(t('alert.success_password', 'Пароль успішно змінено!'), 'success');
                            securityForm.reset();  // Очищаємо поля після успіху
                        } else {
                            showToast(data.detail || t('alert.change_password_error', 'Помилка зміни паролю'), 'error');
                        }
                    } catch (err) {
                        showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
                    }
                });
            }

            // ── 4.5. ЗАВАНТАЖЕННЯ АВАТАРА ──
            const avatarInput = document.getElementById('avatarInput');
            const sidebarAvatar = document.getElementById('sidebarAvatar');
            const mainAvatar = document.getElementById('mainAvatar');

            if (avatarInput) {
                avatarInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Перевірка розміру (макс 2МБ)
                    if (file.size > 2 * 1024 *1024) {
                        showToast(t('alert.big_file', 'Файл занадто великий! Максимум 2 МБ.'), 'error');
                        avatarInput.value = '';
                        return;
                    }
                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        mainAvatar.style.opacity = '0.5';  // Ефект завантаження

                        const response = await fetch(`${API_BASE_URL}/me/avatar`, {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + token
                                // Content-Type НЕ вказуємо, браузер сам поставить multipart/form-data
                            },
                            body: formData
                        });

                        const data = await response.json();

                        if (response.ok) {
                            // ?t=Date.now() потрібен, щоб браузер не показував стару картинку з кешу
                            const newAvatarUrl = `https://minemine.my-work.pp.ua${data.avatar_url}?t=${Date.now()}`;
                            mainAvatar.src = newAvatarUrl;
                            sidebarAvatar.src = newAvatarUrl;
                            showToast(t('alert.avatar_success', 'Аватар успішно оновлено!'), 'success');
                        } else {
                            showToast(data.detail || t('alert.avatar_load_error', 'Помилка завантаження аватара'), 'error');
                        }
                    }catch(err) {
                        console.error(err);
                        showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
                    } finally{
                        mainAvatar.style.opacity = '1';  // Повертаємо прозорість
                        avatarInput.value = ''; // Очищаємо інпут
                    }
                });
            }
        }
}

// ═══════════════════════════════════════════════════════════
//    5. ДИНАМІЧНА ШАПКА (ГІСТЬ vs АВТОРИЗОВАНИЙ)
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const guestNav = document.getElementById('guestNav');
    const authNav = document.getElementById('authNav');
    const logoutBtn = document.getElementById('logoutBtn');

    if (guestNav && authNav) {
        const token = localStorage.getItem('token');

        if (token) {
            guestNav.style.display="none";
            authNav.style.display='flex';
        } else {
            guestNav.style.display="flex";
            authNav.style.display="none";
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');

            const isSubPage = window.location.pathname.includes('/pages');
            window.location.href = isSubPage? '../index.html' : 'index.html'
        });
    }
});

// ═══════════════════════════════════════════════════════════
//    6. АДМІН-ПАНЕЛЬ
// ═══════════════════════════════════════════════════════════

const usersTableBody = document.getElementById('usersTableBody');

if (usersTableBody) {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
    } else {
        // Функція для завантаження списку користувачів
        const loadUsers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    headers: { 'Authorization': 'Bearer ' + token }                  
                });

                if (response.status === 403 || response.status === 401) {
                    showToast(t('alert.access_denied', 'У вас немає прав на цю сторінку'), 'error');
                    window.location.href = '../index.html';
                    return;
                }

                const users = await response.json();
                usersTableBody.innerHTML = '';

                users.forEach(user => {
                    const tr = document.createElement('tr');

                    // Створюємо комірки безпечно (без innerHTML)
                    const tdId = document.createElement('td');
                    tdId.textContent = user.id;

                    const tdName = document.createElement('td');
                    const strongName = document.createElement('strong');
                    strongName.textContent = user.username;
                    tdName.appendChild(strongName);

                    const tdEmail = document.createElement('td');
                    tdEmail.textContent = user.email;

                    const tdRole = document.createElement('td');
                    tdRole.textContent = user.role.toUpperCase();

                    const tdAction = document.createElement('td');
                    const btn = document.createElement('button');
                    btn.className = 'role-btn';
                    btn.textContent = user.role === 'admin' ? 'Зробити користувачем' : 'Зробити адміністратором';
                    btn.onclick = () => changeRole(user.id, user.role == 'admin' ? 'user' : 'admin');
                    tdAction.appendChild(btn);

                    tr.appendChild(tdId);
                    tr.appendChild(tdName);
                    tr.appendChild(tdEmail);
                    tr.appendChild(tdRole);
                    tr.appendChild(tdAction);

                    usersTableBody.appendChild(tr);
                });
            } catch (error) {
                console.error('Помилка завантаження користувачів', error);
            }
        };
        
        // Завантажуємо список при відкритті сторінки
        loadUsers();

        // Глобальна функція для зміни ролі (викликається з HTML)
        window.changeRole = async (userId, newRole) => {
            if(!confirm(`Ви впевненні, що хочете змінити роль на ${newRole}?`)) return;

            try {
                const response = await fetch(`${API_BASE_URL}/users/${userId}/role?role=${newRole}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': 'Bearer ' + token }
                });

                if (response.ok) {
                    showToast(t('alert.role_success', 'Зміна ролі успішна'), 'success');
                    loadUsers();
                } else {
                    const data = await response.json();
                    showToast(data.detail || t('alert.role_change_error', 'Помилка зміни ролі'), 'error');
                }
            } catch (error) {
                showToast(t('alert.connection_error', 'Помилка з\'єднання з сервером'), 'error');
            }
        };
    }
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