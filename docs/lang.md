Пояснення елементів в lang, їх значення, варіації і закриття/відкриття

# Мовні файли (lang/)

<a id="top"></a>

## Зміст

1. [Що це](#1-що-це)
2. [Структура](#2-структура)
3. [Ключі](#3-ключі)
4. [Як додати новий текст](#4-як-додати-новий-текст)
5. [Як додати нову мову](#5-як-додати-нову-мову)
6. [Правила JSON](#6-правила-json)

[↑ На верх](#top)

## 1. Що це

Папка `lang/` містить JSON-файли з перекладами для сайту. Кожен файл — одна мова.

**Файли:**
- `uk.json` — українська (або `uk_ua`)
- `en.json` — англійська (або `en_us`)

**Навіщо:**
- Відокремити текст від коду
- Легко додавати нові мови
- Не чіпати HTML/JS при зміні тексту

[↑ На верх](#top)

---

## 2. Структура

Кожен файл — валідний JSON з парами `"ключ": "значення"`.

**Приклад `uk.json`:**
```json
{
    "page-title": "Майнкрафт",
    "mainpage-title": "TerraFirmaGreg",
    "mainpage-minecraftserver-info0": "TerraFirmaGreg",
    "mainpage-minecraftserver-info1": "Ваніла",
    "status-online": "Онлайн",
    "status-offline": "Офлайн",
    "status-unknown": "Статус недоступний",
    "status-checking": "Перевірка..."
}
```
Приклад en.json:
```json
{
    "page-title": "Minecraft",
    "mainpage-title": "TerraFirmaGreg",
    "mainpage-minecraftserver-info0": "TerraFirmaGreg",
    "mainpage-minecraftserver-info1": "Vanilla",
    "status-online": "Online",
    "status-offline": "Offline",
    "status-unknown": "Status unavailable",
    "status-checking": "Checking..."
}
```

[↑ На верх](#top)

## 3. Ключі

**Ключ** — це назва, яка співпадає з id елемента в HTML.

**Правила:**
- Тільки латиниця, цифри, дефіс
- Без крапок, пробілів, кирилиці
- Описові — щоб було зрозуміло, де використовується

**Приклади:**
| **Ключ** | **Де використовується** |
|---|---|
| `page-title` | `<title>` вкладки |
| `mainpage-title` | `<h1 id="mainpage-title">` |
| `mainpage-minecraftserver-info0` | `<span id="mainpage-minecraftserver-info0">` |
| `status-online` | Підказка статусу (онлайн) |
| `status-offline` | Підказка статусу (офлайн) |

**Формат: сторінка-блок-елемент

**Приклад:** `mainpage-minecraftserver-info0`
- `mainpage` — сторінка
- `minecraftserver` — блок
- `info0` — елемент

[↑ На верх](#top)

## 4. Як додати новий текст

**Крок 1:** У `HTML` — додай елемент з id:
```html
<p id="my-new-text"></p>
```

**Крок 2:** У `uk.json` — додай ключ:
```json
{
    "my-new-text": "Мій новий текст"
}
```

**Крок 3:** У `en.json` — додай переклад:
```json
{
    "my-new-text": "My new text"
}
```

**Крок 4:** JS не чіпаєш — цикл у `loadLanguage` сам підхопить.

**Результат:** текст з'явиться на сторінці. При перемиканні мови — змінюється.

[↑ На верх](#top)

## 5. Як додати нову мову

**Крок 1:** Створи файл `lang/de.json` (наприклад, німецька):
```json
{
    "page-title": "Minecraft",
    "mainpage-title": "TerraFirmaGreg",
    "mainpage-minecraftserver-info0": "TerraFirmaGreg",
    "mainpage-minecraftserver-info1": "Vanilla",
    "status-online": "Online",
    "status-offline": "Offline",
    "status-unknown": "Status nicht verfügbar",
    "status-checking": "Prüfe..."
}
```

**Крок 2:** У `script.js` — додай прапорець:
```javascript
const FLAGS = {
    uk: 'https://flagcdn.com/24x18/ua.png',
    en: 'https://flagcdn.com/24x18/gb.png',
    de: 'https://flagcdn.com/24x18/de.png'  // ← новий
};
```

**Крок 3:** У HTML — додай кнопку в меню:
```html
<button onclick="setLang('de')">
    <img src="https://flagcdn.com/24x18/de.png" alt=""> Deutsch
</button>
```

Готово. Мова працює.

[↑ На верх](#top)

## 6. Правила JSON

**JSON** дуже вибагливий. Одна помилка — файл не завантажиться.

**Правила:**

Подвійні лапки " — не одинарні '
```json
{ "ключ": "значення" }   ✅
{ "ключ": "значення" }   ❌
```

**Кома** між парами — обов'язкова
```json
{
    "ключ1": "значення1",
    "ключ2": "значення2"
}   ✅
```
Без коми після останньої пари
```json
{
    "ключ1": "значення1",
    "ключ2": "значення2"
}   ✅
```

Без коментарів — JSON їх не підтримує
```json
{
    "ключ": "значення"  // ❌ коментар
}
```
[↑ На верх](#top)