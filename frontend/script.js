// Визначаємо мову url. Типово = uk
const params = new URLSearchParams(window.location.search);
const lang = params.get('lang') || 'uk';

// Завантажуємо JSON файл з перекладом
fetch(`lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
        // Встановлюємо текст для елементів з id "title" та "subtitle", якщо вони є
    if (data.title) {
    document.getElementsById('title').innerHTML = data.title;
    }
    if (data.subtitle) {
        document.getElementsById('subtitle').innerHTML = data.subtitle;
    }
})
.catch(error => console.error('Помилка', error));

function setLang(newLang){
        window.location.search = `?lang${newLang}`
        }