// ═══════════════════════════════════════════════════════════
//    ADMIN.JS — адмін-панель (список користувачів, зміна ролей)
//    Сторінка: admin.html
//    Потребує: core.js (API_BASE_URL, t, showToast, getErrorMessage,
//              readJson, requireToken, authHeaders)
// ═══════════════════════════════════════════════════════════

const usersTableBody = document.getElementById('usersTableBody');

// id поточного адміна (щоб не показувати кнопку біля себе)
let currentUserId = null;

// ─────────────────────────────────────────────
//  1. ОБРОБКА ПОМИЛОК ДОСТУПУ
// ─────────────────────────────────────────────

// Повертає true, якщо доступу немає (і вже перенаправили користувача)
function handleAccessError(response) {
    if (response.status === 401) {
        // Токен застарів або недійсний — на вхід
        localStorage.removeItem('token');
        window.location.href = 'login.html'
        return true;
    }
    if (response.status === 403) {
        // Увійшов, але не адмін — на головну
        showToast(t('alert.access_denied', 'У вас немає прав на цю сторінку'), 'error');
        setTimeout(() => { window.location.href = '../index.html';}, 1500);
        return true;
    }
    return false;
}

// ─────────────────────────────────────────────
//  2. ТАБЛИЦЯ КОРИСТУВАЧІВ
// ─────────────────────────────────────────────

// Створює комірку таблиці з текстом (безпечно, без innerHTML)
function createCell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
}

// Створює рядок таблиці для одного користувача
function createUserRow(user) {
    const tr = document.createElement('tr');

    // Ім'я жирним
    const tdName = document.createElement('td');
    const strongName = document.createElement('strong');
    strongName.textContent = user.username;
    tdName.appendChild(strongName);

    // Кнопка зміни ролі — тільки якщо зміна можлива
    const tdAction = document.createElement('td');
    const canChange = user.role !== 'owner' && user.id !== currentUserId;

    if (canChange) {
        const newRole = user.role === 'admin' ? 'user' : 'admin';

        const btn
    }
}