// ═══════════════════════════════════════
//     АДРЕСА БЕКЕНДУ (одна на весь сайт)
// ═══════════════════════════════════════
const API_ORIGIN = `https://minemine.my-work.pp.ua`;
const API_BASE_URL = `${API_ORIGIN}/api`;

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
}

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
        history.replaceState({}, '', url);

        // Повідомляємо інші скрипти, що мова змінилася
        // (наприклад, server-status.js оновить підказки статусу)
        document.dispatchEvent('Помилка завантаження мови', error);
    } catch (error) {
        console.error('Помилка завантаження мови', error);
    }
    
}

// Функція перемикання(викликається кнопкою)
function setLang(newLang) {
    loadLanguage(newLang);
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