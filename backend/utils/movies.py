import re
import requests
import json
from core.config import Settings


async def get_title_api(id: int):
    url = f"https://api.kinopoisk.dev/v1.4/movie/{id}"
    headers = {
        "accept": "application/json",
        "X-API-KEY": f"{Settings.X_API_KEY}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        title = data["name"]
        year = data["year"]
        if not title:
            title = 'None'
        if not year:
            year = None
        print(data)  # Вывод JSON-ответа
    else:
        print(f"Ошибка {response.status_code}: {response.text}")
    return title, year