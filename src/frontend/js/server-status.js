// ═══════════════════════════════════════════════════════════
//    SERVER-STATUS.JS — статус Minecraft-серверів
//    Сторінка: index.html
//    readJson: Потребує: core.js (API_BASE_URL, t, readJson)
// ═══════════════════════════════════════════════════════════

// Як часто перевіряти статус (мілісекунди)
const STATUS_INTERVAL = 30000;

// Сервери: назва для API → id іконки в HTML
const SERVERS = [
    { name: 'terrafirmagreg', iconId: 'status-tfg' },
    { name: 'vanilla', iconId: 'status-vanilla' }
];

// Стан іконки → [ключ перекладу, запасний текст]
const STATUS_TITLES = {
    online:  ['status-online',  'Online'],
    offline: ['status-offline', 'Offline'],
    unknown: ['status-unknown', 'Status unavailable'],
    checking: ['status-checking', 'Checking...']
};

// ─────────────────────────────────────────────
//  1. ВІДОБРАЖЕННЯ СТАНУ
// ─────────────────────────────────────────────

// Встановлює стан іконки: колір (через клас) і підказку
function setStatus(icon, state) {
    icon.classList.remove('online', 'offline', 'checking');
    if (state !== 'unknown') {
        icon.classList.add(state);
    }
    icon.dataset.state = state;

    const [key, fallback] = STATUS_TITLES[state];
    icon.title = t(key, fallback);
}

// Оновлює підказки після зміни мови (стан не змінюється)
function refreshStatusTitles() {
    SERVERS.forEach(({ iconId }) => {
        const icon = document.getElementById(iconId);
        if (icon && icon.dataset.state) {
            setStatus(icon, icon.dataset.state);
        }
    });
}

// ─────────────────────────────────────────────
//  2. ПЕРЕВІРКА СТАТУСУ
// ─────────────────────────────────────────────


async function checkServerStatus(serverName, iconId) {
    const icon = document.getElementById(iconId);
    if(!icon) return;
    
    setStatus(icon, 'checking');

    try{
        const response = await fetch(`${API_BASE_URL}/status/${serverName}`);
        if (!response.ok) {
            setStatus(icon, 'unknown');
            return;
        }
        const data = await readJson(response);
        setStatus(icon, data.online ? 'online' : 'offline');
    } catch (error) {
        console.error('Помилка перевірки статусу', error);
        setStatus(icon, 'unknown');
    }
}

function checkAllServers() {
    // Вкладка прихована — не навантажуємо сервер даремно
    if (document.hidden) return;
    SERVERS.forEach(({ name, iconId }) => checkServerStatus(name, iconId));
}

// ─────────────────────────────────────────────
//  3. ЗАПУСК
// ─────────────────────────────────────────────

// Перша перевірка після завантаження сторінки
document.addEventListener('DOMContentLoaded', checkAllServers);

// Повторна перевірка кожні 30 секунд
setInterval(checkAllServers, STATUS_INTERVAL);

// Оновлення підказок, коли core.js змінив мову
document.addEventListener('languagechange', refreshStatusTitles);