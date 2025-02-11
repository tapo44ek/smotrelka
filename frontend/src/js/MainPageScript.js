const KINOPOISK_MATCHER = /kinopoisk\.ru\/(film|series)\/.*/;
const IMDB_MATCHER = /imdb\.com\/title\/tt\.*/;
const TMDB_MATCHER = /themoviedb\.org\/(movie|tv)\/\.*/;
const LETTERBOXD_MATCHER = /letterboxd\.com\/film\/\.*/;
const MATCHERS = [KINOPOISK_MATCHER, IMDB_MATCHER, TMDB_MATCHER, LETTERBOXD_MATCHER];

const send_data_url = "http://localhost:8000/auth/history/add/"; // Укажи свой URL API

export async function sendMovieData(data) {
  const dataSerialized = JSON.stringify(data);
  try {
    const response = await fetch(send_data_url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: dataSerialized
    });

    // if (response.redirected) {
    //   window.location.href = response.url;
    // } else 
    if (response.ok) {
      console.log("Данные успешно отправлены");
    } else {
      console.error("Ошибка при отправке данных:", response.status);
    }
  } catch (error) {
    console.error("Ошибка сети при отправке данных:", error);
  }
}

export async function fetchTitleKinopoisk(link) {
  try {
    const match = link.match(/kinopoisk\.ru\/film\/(\d+)\//);
    if (!match) throw new Error("Не удалось извлечь ID фильма из URL");

    const movieId = match[1];

    const response = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${movieId}`, {
      method: "GET",
      headers: {
        "X-API-KEY": "b727d67c-aee0-47bf-b59d-f83353fbea0f",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Ошибка при запросе: ${response.status}`);

    const data = await response.json();
    return data?.nameRu || null;
  } catch (error) {
    console.error("Ошибка при извлечении данных фильма:", error);
    return null;
  }
}

export async function fetchTitleWithFallback(link) {
  try {
    const response = await fetch("http://localhost:8000/auth/history/fetch_movie/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ "url": link })
    });

    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

    const data = await response.json();
    return data?.name || null;
  } catch (error) {
    console.error("Ошибка:", error);
    return null;
  }
}

export async function extractMovieData(url) {
  try {
    if (url.match(KINOPOISK_MATCHER)) {
      const id = url.split("/").at(4);
      const title = await fetchTitleWithFallback(url) || url;
      return { kinopoisk: id, title };
    }

    if (url.match(IMDB_MATCHER)) {
      return { imdb: url.split("/").at(4), title: url };
    }

    if (url.match(TMDB_MATCHER)) {
      return { tmdb: url.split("/").at(4).split("-").at(0), title: url };
    }

    return null;
  } catch (error) {
    console.error("Ошибка при обработке данных:", error);
    return null;
  }
}