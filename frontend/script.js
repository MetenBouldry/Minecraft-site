// Визначаємо мову url. Типово = uk
const params = new URLSearchParams(window.location.search);
const lang = params.get('lang') || 'uk';

// Завантажуємо JSON файл з перекладом
fetch(`lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
        // Заголовок окремо
    if (data.title) {
    document.getElementById('title').innerHTML = data.title;
    }
    // Цикл для решти, окрім заголовка
    Object.keys(data).forEach(key => {
        if (key === 'title') return;
        const element = document.getElementById(key);
        if (element) {
            element.innerHTML = data[key];
        }
    })
})
.catch(error => console.error('Помилка', error));

// Функція перемикання мов
function setLang(newLang){
        window.location.search = `?lang=${newLang}`
        }

// Функція відкриття/закриття
function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    menu.classList.toggle('show');
}

// Закрити при кліку поза меню
document.addEventListener('click', (e) => {
    const menu = document.getElementById('langMenu');
    const toggle = document.querySelector('.lang-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('show');
    }

})

// Показати поточну мову на кнопці
document.addEventListener('DOMContentLoaded', () => {
    const current = document.getElementById('currentLang');
    if (current) {
        current.textContent = lang.toUpperCase(); 
    }
})
