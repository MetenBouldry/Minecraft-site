Пояснення елементів в style, їх значення, варіації і закриття/відкриття

# Стилі сайту (style.css)

<a id="top"></a>

## Зміст

1. [Загальний огляд](#1-загальний-огляд)
2. [Базові стилі (`body`)](#2-базові-стилі-body)
3. [Контейнер (`.content`)](#3-контейнер-content)
4. [Заголовок (`.content h1`)](#4-заголовок-content-h1)
5. [Перемикач мов](#5-перемикач-мов)
6. [Статуси серверів](#6-статуси-серверів)
7. [Адаптивність](#7-адаптивність)

[↑ На верх](#top)

---

## 1. Загальний огляд

Файл `style.css` відповідає за зовнішній вигляд сайту. Він не створює структуру (це HTML) і не додає логіку (це JS). Тільки колір, розмір, розташування, анімації.

**Що НЕ робить `style.css`:**
- Не створює елементи (це `index.html`).
- Не змінює текст (це `script.js`).

**Як підключається:**
```html
<link rel="stylesheet" href="style.css">
```
У `<head>` файлу `index.html`.

[↑ На верх](#top)

## 2. Базові стилі (`body`)

**Що це:** Стилі для всього `body`. Вони впливають на всю сторінку.

**Код:**
```css
body {
    background-image: url("image/background.jpg");
    background-size: cover;
    background-position: center 0;
    background-repeat: no-repeat;

    min-height: 100vh;
    margin: 0;

    display: flex;
    align-items: flex-start;
    justify-content: center;
}
```
**Покроково:**

- `background-image` — встановлює фонову картинку.
- `background-size: cover` — розтягує картинку на весь екран (без деформації).
- `background-position: center 0` — центрує по горизонталі, притискає до верху.
- `background-repeat: no-repeat` — не повторює картинку.
- `min-height: 100vh` — мінімальна висота — 100% висоти екрана.
- `margin: 0` — прибирає стандартні відступи браузера.
- `display: flex` — вмикає `Flexbox` (для центрування).
- `align-items: flex-start` — притискає контент до верху.
- `justify-content: center` — центрує контент по горизонталі.

[↑ На верх](#top)

## 3. Контейнер (`.content`)

**Що це:** Головна обгортка для всього контенту на сторінці.

**Код:**
```css
.content {
    width: 100%;
    box-sizing: border-box;
    padding: 40px 20px 20px;
}
```
**Покроково:**

- `width: 100%` — займає всю ширину екрана.
- `box-sizing: border-box` — відступи (`padding`) не збільшують ширину (загальна ширина залишається 100%).
- `padding` — відступи: зверху `40px`, з боків `20px`, знизу `20px`.

[↑ На верх](#top)

## 4. Заголовок (`.content h1`)

**Що це:** Стилі для головного заголовка TerraFirmaGreg. Тут найбільше ефектів: градієнт, обводка, нахил.

**Код:**
```css
.content h1 {
    margin: 0 0 30px;
    transform: skewX(-15deg);
    z-index: 1000;

    font-family: 'Arial Black', sans-serif;
    text-transform: uppercase;

    background: linear-gradient(180deg,
        #ff5555,
        #d92020,
        #a31010,
        #6b0a0a,
        #3d0000);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;

    -webkit-text-stroke: 3px #000;

    letter-spacing: 3px;
    font-size: clamp(32px, 9vw, 55px);
    font-weight: bold;
    text-align: center;
}
```

**Розбір ефектів:**

**Нахил:**

- `transform: skewX(-15deg)` — нахиляє текст вправо.

**Градієнт** (заливка тексту):

- `background: linear-gradient(...)` — створює градієнт від світло-червоного до майже чорного.
- `background-clip: text` — обрізає фон по формі літер.
- `-webkit-text-fill-color: transparent` — робить літери прозорими, щоб було видно градієнт.

**Обводка:**

- `-webkit-text-stroke: 3px #000` — додає чорну обводку товщиною `3px`.

**Адаптивний розмір:**

- `font-size: clamp(32px, 9vw, 55px)` — розмір шрифту підлаштовується під ширину екрана (мінімум `32px`, максимум `55px`).

**Інше:**

- `letter-spacing: 3px` — відстань між літерами.
- `text-transform: uppercase` — всі літери великі.

[↑ На верх](#top)

## 5. Перемикач мов

**Що це:** Стилі для випадаючого меню з прапорцями.

`.lang-switch` (контейнер)

**Код:**
```css
.lang-switch {
    position: fixed;
    top: 5px;
    right: 25px;
    z-index: 10;
}
```
**Навіщо:** Фіксує меню у правому верхньому куті.

`.lang-toggle` (кнопка)

**Код:**
```css
.lang-toggle {
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 6px 6px;
    border-radius: 20px;
    font-size: 10px;
    cursor: pointer;
    min-width: 40px;
    font-family: inherit;
}
```
**Навіщо:** Напівпрозора чорна кнопка із заокругленими кутами.

`.lang-menu` (список)

**Код:**
```css
.lang-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 5px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    overflow: hidden;
    min-width: 100%;
}
.lang-menu.show {
    display: block;
}
```
**Навіщо:** Приховане за замовчуванням. Клас `.show` (додається через JS) показує його.

[↑ На верх](#top)

## 6. Статуси серверів

**Що це:** Стилі для кольорових кружечків (індикаторів), які показують, чи онлайн сервер.

### `.status-icon` (базовий стиль)

**Код:**
```css
.status-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
    background: #888;
    transition: all 0.3s;
}
```
**Навіщо:**

- Робить коло 12x12 пікселів.
- Типово — сіре (колір `#888`).
- `transition: all 0.3s` — плавна зміна кольору (коли статус змінюється).

### Стани статусу

**Код:**
```css
.status-icon.checking {
    background: #fbbf24;
    animation: pulse 1s infinite;
}

.status-icon.online {
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
}

.status-icon.offline {
    background: #ef4444;
    box-shadow: 0 0 8px #ef4444;
}
```
**Що робить кожен стан:**

- `.checking` (перевірка) — жовтий (`#fbbf24`), пульсує (анімація `pulse`).
- `.online` (онлайн) — зелений (`#4ade80`), з світінням (`box-shadow`).
- `.offline` (офлайн) — червоний (`#ef4444`), з світінням.

### Анімація pulse

**Код:**
```css
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
```
**Що робить:** Кружечок пульсує (змінює прозорість від 100% до 40% і назад).

[↑ На верх](#top)

## 7. Адаптивність

**Що це:** Стилі, які змінюють вигляд на маленьких екранах (телефонах).

**Код:**
```css
@media (max-width: 600px) {
    .content {
        padding-top: 60px;
    }

    .content h1 {
        letter-spacing: 1px;
        -webkit-text-stroke-width: 2px;
    }

    .server-info {
        font-size: 17px;
    }
}
```
Що змінюється на телефоні (екран ≤ 600px):

- `.content` — верхній відступ збільшується до `60px` (щоб було місце для шторки мов).
- `.content h1` — менший міжлітерний інтервал (`1px`) і тонша обводка (`2px`).
- `.server-info` — шрифт стає трохи меншим (`17px`).

[↑ На верх](#top)