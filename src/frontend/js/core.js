// ═══════════════════════════════════════
//     1. АДРЕСА БЕКЕНДУ (одна на весь сайт)
// ═══════════════════════════════════════
const API_ORIGIN = `https://minemine.my-work.pp.ua`;
const API_BASE_URL = `${API_ORIGIN}/api`;

// ═══════════════════════════════════════
//     2. СИСТЕМА СПОВІЩЕНЬ (ТОСТИ)
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

    // 4. Наповнюємо безпечно (textContent замість innerHTML)
    const iconEl = document.createElement('span');
    iconEl.className = 'toast-icon';
    iconEl.textContent = icon;

    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;

    toast.append(iconEl, messageEl);

    // 5. Додаємо на сторінку
    container.appendChild(toast);

    // 6. Видаляємо через 3 секунди (з анімацією)
    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000)
}

// Текст помилки з відповіді сервера.
// FastAPI повертає detail як рядок, а помилки валідації (422) — як масив
function getErrorMessage(data, fallback) {
    if (!data || !data.detail) return fallback;
    if (typeof data.detail == 'string') return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map(e => e.msg).join('; ');
    return fallback;
}

// ═══════════════════════════════════════
//     3. ПЕРЕКЛАДИ (i18n)
// ═══════════════════════════════════════

// Прапорці мов. Щоб додати мову — додай рядок сюди і в LANG_NAMES
const FLAGS = {
    uk: 'https://flagcdn.com/24x18/ua.png',
    en: 'https://flagcdn.com/24x18/gb.png'
};

// Назви мов для меню
const LANG_NAMES = {
    uk: 'Українська',
    en: 'English'
};

// Поточні переклади
let translation = {};

// Дістає значення з вкладеного об'єкта за шляхом "main.login"
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Бере текст з JSON за ключем. Якщо ключа немає — повертає fallback
function t(key, fallback) {
    const translation = getNestedValue(translations, key);
    return translation || fallback;
}

// Завантаження та застосування мови
async function loadLanguage(lang) {
    try {
        const basePath = window.location.pathname.includes('/pages') ? '../' : '';
        const response = await fetch(`${basePath}lang/${lang}.json`);
        const data = await response.json();

        translation = data; // Зберігаємо для функції t()

        // Оновлюємо всі елементи з атрибутом data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n'); // Наприклад, "main.login"
            const translation = getNestedValue(data, key);
            if (translation) {
                el.textContent = translation;
            }
        });

        // Мова документа та заголовок вкладки
        document.documentElement.lang = lang;
        if (data.page && data.page.title){
            document.title = data.page.title;
        }

        // Прапорець на кнопці перемикача
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            const flag = document.createElement('img');
            flag.src = FLAGS[lang];
            flag.alt = '';
            currentLangEl.replaceChildren(flag);
        }

        // Запам'ятовуємо вибір
        localStorage.setItem('lang', lang);

        // Оновлюємо URL (без перезавантаження і без нового запису в історії)
        const url = new URL(window.location.href);
        url.searchParams.set('lsng', lang);
        history.replaceState({}, '', url);

        // Повідомляємо інші скрипти, що мова змінилася
        // (наприклад, server-status.js оновить підказки статусу)
        document.dispatchEvent(new CustomEvent('languagechance'));
    } catch (error) {
        console.error('Помилка завантаження мови', error);       
    }
}

// ═══════════════════════════════════════
//     4. ПЕРЕМИКАЧ МОВ (створюється з JS)
//     У HTML: <div class="lang-switch" id="langSwitcher"></div>
// ═══════════════════════════════════════
function renderLangSwitcher() {
    const holder = document.getElementById('langSwitcher');
    if (!holder) return; // на цій сторінці перемикача немає

    // ── Кнопка: [🌐] ▼ ──
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'lang-toggle';

    const current = document.createElement('span');
    current.id = 'currentLang'; // сюди loadLanguage() поставить прапорець
    current.textContent = '🌐';

    toggle.append(current, ' ▼');

    // ── Випадне меню ──
    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.id = 'langMenu';

    // Кнопка для кожної мови з FLAGS
    Object.keys(FLAGS).forEach(lang => {
        const btn = document.createElement('button');
        btn.type = 'button';

        const img = document.createElement('img');
        img.src = FLAGS[lang];
        img.alt = '';

        btn.append(img, ' ', LANG_NAMES[lang]);
        btn.addEventListener('click', () => {
            loadLanguage(lang);
            menu.classList.remove('show');
        });

        menu.appendChild(btn);
    });

    // Відкрити / закрити меню
    toggle.addEventListener('click', () => menu.classList.toggle('show'));

    holder.append(toggle, menu);
}

// ═══════════════════════════════════════
//     5. ПОКАЗАТИ / СХОВАТИ ПАРОЛЬ
//     У HTML: onclick="togglePassword('password', this)"
// ═══════════════════════════════════════
function togglePassword(inputId, iconElement) {
    const input = /** @type {HTMLInputElement | null} */ (document.getElementById(inputId));
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        iconElement.textContent = '🚫'; // закрите вічко.
    } else {
        input.type = 'password';
        iconElement.textContent = '👁️';
    }
}

// ═══════════════════════════════════════
//     6. ЗАПУСК ПІСЛЯ ЗАВАНТАЖЕННЯ СТОРІНКИ
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // ── 1. Створюємо перемикач мов (до loadLanguage — йому потрібен #currentLang) ──
    renderLangSwitcher();

    // ── 2. Визначення мови ──
    // Порядок: URL → localStorage → мова браузера → українська
    let lang = new URLSearchParams(window.location.search).get('lang')
        || localStorage.getItem('lang')
        || (navigator.language.startsWith('uk') ? 'uk' : 'en');

    if (!FLAGS[lang]) {
        lang = 'uk';
    }
    loadLanguage(lang);

    // ── 3. Динамічна шапка (гість / авторизований) ──
    const guestNav = document.getElementById('guestNav');
    const authNav = document.getElementById('authNav');
    const logoutBtn = document.getElementById('logoutBtn');

    if (guestNav && authNav) {
        const token = localStorage.getItem('token');
        guestNav.style.display = token ? 'none' : 'flex';
        authNav.style.display = token ? 'flex' : 'none';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener
    }
})