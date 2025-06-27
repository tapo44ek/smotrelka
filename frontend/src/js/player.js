// playerUtils.js

// 🏷️ Лицензия MIT
/*
MIT License

Copyright (c) 2024 Kirills Reunovs
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// 🎯 True если init() был вызван
let initialized = false;

// 🎯 Версия API
export const REQUIRED_VERSION = '3.1.0';

// 🌐 URL Kinobox API
export const KINOBOX_API = 'https://kinobox.tv/api/players';

// 🎞️ Доступные источники видео
export const SOURCES = [
    'alloha',
    'ashdi',
    'cdnmovies',
    'collaps',
    'hdvb',
    'kodik',
    'vibix',
    'videocdn',
    'voidboost'
];

/**
 * Инициализация плеера
 * @param {object} data Данные о фильме
 * @param {string} [scriptVersion] Версия скрипта
 */
export async function init(data, scriptVersion) {
    if (initialized) return;

    try {
        console.log("▶️ Инициализация плеера с данными:", data.kinopoisk);

        const sources = await fetchSources(data);

        if (!Array.isArray(sources)) {
            console.error("❌ Ошибка: fetchSources() вернул не массив!", sources);
            return;
        }

        if (sources.length === 0) {
            console.warn("⚠️ Нет доступных источников!");
            return;
        }

        console.log("✅ Доступные источники:", sources);

        setSources(sources);

        if (data?.title) {
            setTitle(data.title);
        }

        if (typeof scriptVersion === 'string') checkVersion(scriptVersion);

        // initialized = true;
        return sources;

    } catch (error) {
        console.error("❌ Ошибка при инициализации плеера", error);
    }
}

/**
 * Запрос источников с Kinobox API
 * @param {object} movieData
 */
const PROXY_API = 'https://smotrelka.space/api/auth/history/proxy';

async function fetchSources(movieData) {
  try {
    console.log("Запрос источников для:", movieData);

    const apiURL = new URL(PROXY_API);
    Object.entries(movieData).forEach(([key, value]) => {
      if (value != null) apiURL.searchParams.set(key, value);
    });
    apiURL.searchParams.set('sources', SOURCES.join(','));

    const response = await fetch(apiURL.toString(), {
      method: 'GET',
      // НЕ ставим mode: 'cors' или credentials — не нужно, если сервер сам отвечает с нужным заголовком
    });

    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }

    const playersData = await response.json();

    if (!Array.isArray(playersData)) {
      console.error("❌ API вернул не массив:", playersData);
      return [];
    }

    const validSources = playersData.filter((player) =>
      player?.iframeUrl && player?.success && player?.source
    );
    const priority = ["Alloha", "Collaps", "Vibix"];
    const sortedSources = validSources.sort((a, b) => {
    const aIndex = priority.indexOf(a.source);
    const bIndex = priority.indexOf(b.source);

  // Если источник не найден — ставим в конец (index = Infinity)
    return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
});

    console.log("🎯 Фильтрованные источники:", sortedSources);
    return sortedSources;
  } catch (error) {
    console.error("❌ Ошибка при запросе источников:", error);
    return [];
  }
}

/**
 * Обновление списка источников
 * @param {object[]} sourcesData
 */
function setSources(sourcesData) {
    sourcesData.forEach((source) => {
        console.info(`Доступен источник: ${source.source}`);
    });
}

/**
 * Установка заголовка страницы
 * @param {string} title
 */
function setTitle(title) {
    document.title = `${title} | Kinobox Player`;
}

/**
 * Проверка версии скрипта
 * @param {string} scriptVersion
 */
function checkVersion(scriptVersion) {
    if (REQUIRED_VERSION !== scriptVersion) {
        try {
            const numericRequiredVersion = parseVersion(REQUIRED_VERSION);
            const numericScriptVersion = parseVersion(scriptVersion);

            if (numericScriptVersion < numericRequiredVersion) {
                console.warn(`Требуется версия ${REQUIRED_VERSION}, у вас ${scriptVersion}`);
            }
        } catch (error) {
            console.error('Ошибка проверки версии', error);
        }
    }
}

/**
 * Разбор версии (например, '3.1.0' -> 310)
 * @param {string} version
 * @returns {number}
 */
function parseVersion(version) {
    return parseInt(version.replace(/\D/g, ''), 10);
}