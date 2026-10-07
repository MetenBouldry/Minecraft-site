// Визначаємо мову url. Типово = uk
const params = new URLSearchParams(window.location.search);
const lang = params.get('lang') || 'uk';

// Завантажуємо JSON файл з перекладом
fetch(`lang/${lang}.json`)
    .then(response =>) response.json())
    .then(data => {
        // Встановлюємо текст для елементів з id "title" та "subtitle", якщо вони є