// utils.js

// Логгер
export const logger = {
    info: (...args) => console.info('[Tape Operator Player]', ...args),
    warn: (...args) => console.warn('[Tape Operator Player]', ...args),
    error: (...args) => console.error('[Tape Operator Player]', ...args),
};

/**
 * Возвращает хэш-код из строки
 * @param {string} str Строка для хэширования
 * @return {number} 32-битное целое число
 */
export function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

/**
 * Устанавливает параметр в URL без перезагрузки страницы
 * @param {string} key Ключ параметра
 * @param {string} value Значение параметра
 */
export function setSearchParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState(null, '', url.toString());
}

/**
 * Получает значение параметра из URL
 * @param {string} key Ключ параметра
 * @return {string | null} Значение параметра или null, если не найдено
 */
export function getSearchParam(key) {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
}

/**
 * Преобразует строку версии в числовой формат
 * @param {string} version Версия в строковом формате
 * @return {number} Числовая версия
 */
export function parseVersion(version) {
    return parseInt(version.replace(/\D/g, ''), 10);
}