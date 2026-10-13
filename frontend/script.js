// ═══════════════════════════════════════
//     ПЕРЕМИКАННЯ МОВ (без перезавантаження)
// ═══════════════════════════════════════

// Прапорці для кнопок
const FLAGS = {
    uk: 'https://flagcdn.com/24x18/ua.png',
    en: 'https://flagcdn.com/24x18/gb.png'
};

// Функція завантаження мови
async function loadLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        const data = await response.json();

        // Оновити всі тексти
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.innerHTML = data[key];
            }
        });

        // Оновлення прапорця на іконці
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            currentLangEl.innerHTML = `<img src="${FLAGS[lang]}" alt="" style="width:20px;height:15px;vertical-align:middle;">`;
        }

        // Запам'ятовування вибору
        localStorage.setItem('lang', lang);

        // Оновлення URL( без перезавантаження)
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        history.pushState({}, '', url);
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

    // 2. З loclstorage
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

    loadLanguage(lang);
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

// Закрити після кліку поза меню
document.addEventListener('click', (e) => {
    const menu = document.getElementById('langMenu');
    const toggle = document.querySelector('.lang-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('show');
    }
});