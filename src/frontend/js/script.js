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

// Визначаємо базовий шлях (для index.html та pages/*.html)
const basePath = window.location.pathname.includes('/pages') ? '../' : './';

// Функція завантаження мови
async function loadLanguage(lang) {
    try {
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
            setStatus(icon, 'unknow')
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

// ═══════════════════════════════════════
//     РЕЄСТРАЦІЯ (підключення до API)
// ═══════════════════════════════════════

// Знаходимо форму реєстрації (якщо ми на сторінці register.html)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    // Слухаємо подію submit (коли користувач натискає "Зареєструватися")
    registerForm.addEventListener('submit', async(e) => {
        e.preventDefault(); // Зупиняємо перезавантаження сторінки

        // Беремо значення з полів
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Відправляємо POST-запит на бекенд
            const response = await fetch('http://127.0.0.1:8000/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json()

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
            alert(t('connection-error', 'Помилка з\'єднання'));
        }
    });
}