// ═══════════════════════════════════════
//     ПЕРЕМИКАННЯ МОВ (без перезавантаження)
// ═══════════════════════════════════════

// Прапорці для кнопок
const FLAGS = {
    uk: 'https://flagcdn.com/24x18/ua.png',
    en: 'https://flagcdn.com/24x18/gb.png'
};

// Поточні переклади (використовуються й для підказок статусу)
let translations = {};

// Функція t() — бере текст з JSON за ключем.
// Якщо ключа немає — повертає fallback (запасний текст)
function t(key, fallback) {
    return translations[key] || fallback;
}

// Функція завантаження мови
async function loadLanguage(lang) {
    try {
        const basePath = window.location.pathname.includes('/pages') ? '../' : '';
        const response = await fetch(`${basePath}lang/${lang}.json`);
        const data = await response.json();
        translations = data;

        // Оновити всі тексти
        Object.keys(data).forEach(key => {
            // За id
            const elementById = document.getElementById(key);
            if (elementById) {
                elementById.textContent = data[key];
            }

            // За data-i18n
            const elementByAttr = document.querySelectorAll(`[data-i18n="${key}"]`);
            elementByAttr.forEach(el => {
                el.textContent = data[key];
            });
        });

        // Мова документа та заголовок вкладки
        document.documentElement.lang = lang;
        if (data['page-title']) {
            document.title = data['page-title'];
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
    const toggle = document.querySelector('.lang-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// ═══════════════════════════════════════
//         СТАТУС MINECRAFT-СЕРВЕРІВ
// ═══════════════════════════════════════

// TODO: замінити на реальні URL, коли буде backend
const API_URL ='';

const SERVERS = [
    { name: 'terrafirmagreg', iconId: 'status-tfg' },
    { name: 'vanila', iconId: 'status-vanila' }
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

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Базова URL-адреса бекенду

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
                alert(t('reg-success', 'Реєстрація успішна!'));
                window.location.href = 'login.html';
            } else {
                // Помилка — показуємо текст з сервера
                alert(t('reg-error', 'Помилка') + ': ' + (data.detail || t('unknown-error', 'Невідома помилка')));
            }
        } catch (error) {
            // Помилка з'єднання (сервер не запущений)
            console.error(error);
            alert(t('connection-error', 'Помилка з\'єднання з сервером'));

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
                alert(t('login-error', 'Невірний логін або пароль'));
            }
        } catch (error) {
            console.error(error);
            alert(t('connection-error', 'Помилка з\'єднання з сервером'));
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
//    5. СТОРІНКА ПРОФІЛЮ (ВКЛАДКИ ТА ЛОГІКА)
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
                const defaultAvatar = 'https://via.placeholder.com/100';
                const avatarUrl = data.avatar_url ? `http://127.0.0.1:8000${data.avatar_url}`: defaultAvatar; //Переписати при переносі на хостинг

                document.getElementById('sidebarAvatar').src = avatarUrl;
                document.getElementById('mainAvatar').src = avatarUrl;
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
                            alert('Дані успішно оновлено!');
                            // Оновлюємо ім'я в бічній панелі
                            document.getElementById('sidebarUsername').textContent = data.username;
                        } else {
                            alert(data.detail || 'Помилка збереження');
                        }
                    } catch (err) {
                        alert('Помилка з\'єднання з сервером');
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
                            alert('Пароль успішно змінено!');
                            securityForm.reset();  // Очищаємо поля після успіху
                        } else {
                            alert(data.detail || 'Помилка зміни паролю');
                        }
                    } catch (err) {
                        alert('Помилка з\'єднання з сервером')
                    }
                });
            }

            // ── 5.5. ЗАВАНТАЖЕННЯ АВАТАРА ──
            const avatarInput = document.getElementById('avatarInput');
            const sidebarAvatar = document.getElementById('sidebarAvatar');
            const mainAvatar = document.getElementById('mainAvatar');

            if (avatarInput) {
                avatarInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Перевірка розміру (макс 2МБ)
                    if (file.size > 2 * 1024 *1024) {
                        alert('Файл занадто великий! Максимум 2 МБ.');
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
                            const newAvatarUrl = `http://127.0.0.1:8000${data.avatar_url}?t=${Date.now()}`;
                            mainAvatar.src = newAvatarUrl;
                            sidebarAvatar.src = newAvatarUrl;
                            alert('Аватар успішно оновлено!');
                        } else {
                            alert(data.detail || 'Помилка завантаження аватара');
                        }
                    }catch(err) {
                        console.error(err);
                        alert('Помилка з\'єднання з сервером');
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
                    alert('У вас немає прав на цю сторінку');
                    window.location.href = '../index.html';
                    return;
                }

                const users = await response.json();
                usersTableBody.innerHTML = '';

                users.forEach(user => {
                    const tr = document.createElement('tr');

                    // Визначаємо, яка кнопка має бути
                    const actionBtn = user.role === 'admin'
                        ? `<button class="role-btn" onclick="changeRole(${user.id}, 'user')">Зробити користувачем</button>`
                        : `<button class="role-btn" onclick="changeRole(${user.id}, 'admin')">Зробити адміністратором</button>`;
                    
                    tr.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td><strong>${user.role.toUpperCase()}</strong></td>
                        <td>${actionBtn}</td>
                    `;
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
                    alert('Зміна ролі успішна');
                    loadUsers();
                } else {
                    const data = await response.json();
                    alert(data.detail || 'Помилка зміни ролі');
                }
            } catch (error) {
                alert('Помилка з\'єднання з сервером');
            }
        };
    }
}