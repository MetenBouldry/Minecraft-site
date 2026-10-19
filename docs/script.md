Пояснення елементів в script, їх значення, варіації і закриття/відкриття

# Логіка сайту (script.js)

<a id="top"></a>

## Зміст

1. [Загальний огляд](#1-загальний-огляд)
2. [Змінні та константи](#2-змінні-та-константи)
3. [Перемикання мов (Логіка)](#3-перемикання-мов-логіка)
4. [Перемикання мов (UI)](#4-перемикання-мов-ui)
5. [Статус серверів](#5-статус-серверів)
6. [Ініціалізація](#6-ініціалізація)

[↑ На верх](#top)

---

## 1. Загальний огляд

Файл `script.js` відповідає за дві головні функції:
1. **Перемикання мов** — без перезавантаження сторінки. Текст береться з JSON-файлів (`lang/uk.json`, `lang/en.json`).
2. **Статус серверів** — показує, чи онлайн сервер (поки що фейково, в майбутньому — через API).

**Що НЕ робить `script.js`:**
- Не стилізує сторінку (це `style.css`).
- Не створює розмітку (це `index.html`).

**Як підключається:**
```html
<script src="script.js"></script>
```

Розташований перед `</body>` в `index.html`.

[↑ На верх](#top)

## 2. Змінні та константи

`FLAGS` (константа)
**Що це:** Об'єкт, який зберігає посилання на картинки прапорців для кожної мови.

**Код:**
```javascript
const FLAGS = {
    uk: 'https://flagcdn.com/24x18/ua.png',
    en: 'https://flagcdn.com/24x18/gb.png'
};
```
**Навіщо:** Коли користувач обирає мову, скрипт бере звідси URL прапорця і вставляє його в кнопку.

**Як додати нову мову:** Додати новий ключ (наприклад, de: 'https://flagcdn.com/24x18/de.png').

`API_URL` (константа)

**Що це:** Адреса майбутнього бекенду для перевірки статусу серверів.

**Код:**
```javascript
const API_URL = '';
```
**Навіщо:** Поки що порожній рядок (''). Коли бекенд буде готовий, сюди впишеться URL (наприклад, `https://api.my-site.com`). Поки `API_URL` порожній — статуси показуються як «невідомі» (сірі).

`SERVERS` (константа)

**Що це:** Масив серверів, які треба перевіряти.

**Код:**
```javascript
const SERVERS = [
    { name: 'terrafirmagreg', iconId: 'status-tfg' },
    { name: 'vanila', iconId: 'status-vanila' }
];
```
**Навіщо:** Зручно додавати нові сервери. Кожен об'єкт містить:

- `name` — назва для API.
- `iconId` — `id HTML`-елемента (іконки), яку треба оновити.

`STATUS_TITLES` (константа)

**Що це:** Словник для перекладу статусів (для підказок при наведенні).

**Код:**
```javascript
const STATUS_TITLES = {
    online:  ['status-online',  'Online'],
    offline: ['status-offline', 'Offline'],
    unknown: ['status-unknown', 'Status unavailable'],
    checking: ['status-checking', 'Checking...']
};
```
**Навіщо:** Кожен статус має ключ (для `JSON`) і запасний текст (якщо `JSON` ще не завантажився).

`translations` (змінна)

**Що це:** Глобальна змінна, яка зберігає поточний переклад (`JSON`).

**Код:**
```javascript
let translations = {};
```
**Навіщо:** Коли мова завантажується, сюди зберігається весь об'єкт `JSON`. Функція `t()` бере звідси тексти.

[↑ На верх](#top)

## 3. Перемикання мов (Логіка)

Це **серце** перемикання мов. Функції, які завантажують файли та оновлюють тексти.

### `loadLanguage(lang)`

**Що це:** Асинхронна функція, яка завантажує 'JSON'-файл (переклад) і оновлює всі тексти на сторінці.

**Код:**
```javascript
async function loadLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        const data = await response.json();
        translations = data; // Зберігаємо для t()

        // Оновлюємо всі тексти, де id = ключ
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = data[key];
            }
        });

        // Оновлюємо мову документа та заголовок вкладки
        document.documentElement.lang = lang;
        if (data['page-title']) {
            document.title = data['page-title'];
        }

        // Оновлюємо підказки статусів
        refreshStatusTitles();

        // Оновлюємо прапорець на кнопці
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            currentLangEl.innerHTML = `<img src="${FLAGS[lang]}" alt="" style="width:20px;height:15px;vertical-align:middle;">`;
        }

        // Зберігаємо вибір та оновлюємо URL
        localStorage.setItem('lang', lang);
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        history.pushState({}, '', url);
        
    } catch (error) {
        console.error('Помилка завантаження мови', error);
    }
}
```
**Покроково:**

- `fetch` робить запит до `lang/uk.json` (або `en.json`).
- `await response.json()` перетворює відповідь у `JavaScript`-об'єкт.
- `translations = data` зберігає об'єкт, щоб функція `t()` (для підказок) мала до нього доступ.
- Цикл `forEach` проходить по всіх ключах. Знаходить елементи за `id` і вставляє текст.
- `document.documentElement.lang = lang` оновлює `<html lang="...">`.
- `document.title` змінює текст у вкладці браузера. Оновлює картинку прапорця на кнопці.
- `localStorage` запам'ятовує мову (щоб при перезавантаженні не збилося).
- `history.pushState` змінює `URL` на `?lang=en`, не перезавантажуючи сторінку.

### `t(key, fallback)`

**Що це:** Допоміжна функція для отримання тексту з пам'яті.

**Код:**
```javascript
function t(key, fallback) {
    return translations[key] || fallback;
}
```
**Навіщо:** Використовується для підказок статусу. Якщо переклад ще не завантажився, вона повертає англійський текст (`fallback`), щоб користувач не бачив порожнечу.

[↑ На верх](#top)

## 4. Перемикання мов (UI)

Ці функції реагують на дії користувача (кліки).

### `setLang(newLang)`

**Що це:** Викликається при кліку на прапорець у меню.

**Код:**
```javascript
function setLang(newLang) {
    loadLanguage(newLang);
}
```
**Навіщо:** Просто передає обрану мову у `loadLanguage`. Розділення потрібне для майбутнього (наприклад, додати анімацію).

### `toggleLangMenu()`

**Що це:** Відкриває/закриває випадаюче меню (шторку) з мовами.

**Код:**
```javascript
function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}
```
**Навіщо:** Додає або прибирає клас `show`. Коли клас є — `CSS` показує меню (`display: block`).

Обробник кліку поза меню

**Що це:** Закриває меню, якщо клікнути в будь-якому іншому місці.

**Код:**
```javascript
document.addEventListener('click', (e) => {
    const menu = document.getElementById('langMenu');
    const toggle = document.querySelector('.lang-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('show');
    }
});
```
*Навіщо:* Зручність. Не треба шукати хрестик, щоб закрити меню.

Визначення мови при старті

**Що це:** Спрацьовує один раз, коли сторінка завантажилась.

**Код:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    let lang;

    // 1. З URL (?lang=en)
    const params = new URLSearchParams(window.location.search);
    lang = params.get('lang');

    // 2. З localStorage
    if (!lang) {
        lang = localStorage.getItem('lang');
    }

    // 3. З мови браузера
    if (!lang) {
        lang = navigator.language.startsWith('uk') ? 'uk' : 'en';
    }

    // 4. Типово
    if (!lang || !FLAGS[lang]) {
        lang = 'uk';
    }

    loadLanguage(lang);
});
```
**Навіщо:** Щоб сайт відкрився правильною мовою:

Якщо в `URL` є `?lang=en` — бере її.
Інакше — згадує попередній вибір (`localStorage`).
Інакше — дивиться мову браузера.
Якщо нічого — українська.

[↑ На верх](#top)

## 5. Статус серверів

Ці функції відповідають за перевірку та відображення статусу Minecraft-серверів (онлайн/офлайн).

### `setStatus(icon, state)`

**Що це:** Оновлює вигляд іконки статусу та її підказку (title).

**Код:**
```javascript
function setStatus(icon, state) {
    icon.classList.remove('online', 'offline', 'checking');
    if (state !== 'unknown') {
        icon.classList.add(state);
    }
    icon.dataset.state = state;
    const [key, fallback] = STATUS_TITLES[state];
    icon.title = t(key, fallback);
}
```
**Покроково:**

Прибирає всі попередні класи (`online`, `offline`, `checking`).
Додає новий клас (крім `unknown` — для нього залишається сірий фон).
Записує стан у `dataset.state` (щоб знати, який статус зараз).
Бере зі словника `STATUS_TITLES` ключ і запасний текст.
Через функцію `t()` отримує перекладений текст і ставить його в `title` (підказка при наведенні).

### `refreshStatusTitles()`

**Що це:** Оновлює підказки (`title`) у всіх іконок статусу після зміни мови.

**Код:**
```javascript
function refreshStatusTitles() {
    SERVERS.forEach(({ iconId }) => {
        const icon = document.getElementById(iconId);
        if (icon && icon.dataset.state) {
            setStatus(icon, icon.dataset.state);
        }
    });
}
```
**Навіщо:** Коли користувач змінює мову, текст підказки (наприклад, «Онлайн» → «Online») має оновитись без перезавантаження сторінки.

### `checkServerStatus(serverName, iconId)`

**Що це:** Головна функція перевірки. Поки що показує нейтральний статус, бо `API_URL` порожній.

**Код:**
```javascript
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setStatus(icon, data.online ? 'online' : 'offline');
    } catch (error) {
        console.error('Помилка перевірки статусу', error);
        setStatus(icon, 'unknown');
    }
}
```
**Як працює:**

Якщо `API_URL` порожній — ставить статус `unknown` і виходить.
Якщо є `API` — ставить `checking` (жовта пульсація).
Робить запит до `${API_URL}/status/${serverName}`.
Якщо відповідь успішна — ставить `online` або `offline`.
Якщо помилка — ставить `unknown`.

### `checkAllServers()`

**Що це:** Перевіряє всі сервери зі списку `SERVERS`.

**Код:**
```javascript
function checkAllServers() {
    SERVERS.forEach(({ name, iconId }) => checkServerStatus(name, iconId));
}
```
[↑ На верх](#top)

## 6. Ініціалізація

Ці рядки запускають всю логіку при завантаженні сторінки.

### Перевірка при завантаженні
```javascript
document.addEventListener('DOMContentLoaded', checkAllServers);
```
**Що робить:** Як тільки `HTML` завантажився — перевіряє статуси всіх серверів.

### Періодичне оновлення
```javascript
if (API_URL) {
    setInterval(checkAllServers, 30000);
}
```
**Що робить:** Якщо є `API` (бекенд), то кожні 30 секунд (30000 мс) оновлює статуси.

[↑ На верх](#top)