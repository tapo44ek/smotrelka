# Vibix Embed Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести Vibix с `iframe_url` на `embed_code` + Rendex SDK (`<ins>`), сделать опрос балансеров асинхронным и параллельным, не падать без `kinopoisk`, и убрать вероятную причину «невидимых, но кликабельных» плееров на Samsung Tizen 6.

**Architecture:** Бэк разбирает строку `embed_code` (`data-publisher-id="…" data-type="…" data-id="…"`) в структуру `embed` и отдаёт её рядом с `iframeUrl`; сырой HTML на фронт не уходит. Фронт подключает SDK в `<head>` и для источника с `embed` рендерит `<ins data-*>` вместо `<iframe>`; выбор источника хранится по имени, а не по `iframeUrl`. Публикаторский ID меняется, поэтому берётся только из ответа API, не хардкодится.

**Tech Stack:** FastAPI, httpx 0.28 (AsyncClient, MockTransport для тестов), unittest (stdlib, без новых зависимостей); React 19, Vite 6, Tailwind 3.4.

**Spec:** требования из чата 2026-10-07 (ответ API Vibix с `embed_code`, инструкция Rendex SDK v2).

## Global Constraints

- SDK: `https://graphicslab.io/sdk/v2/rendex-sdk.min.js` и `https://alt.graphicslab.io/sdk/v2/rendex-sdk.min.js`, оба `async`, в `<head>`.
- Обязательные атрибуты `<ins>`: `data-publisher-id`, `data-type` (`movie|series|kp|imdb`), `data-id`.
- `data-publisher-id` меняется — только из `embed_code`, никаких констант.
- Alloha: `verify=False` остаётся (TLS выключен намеренно).
- Формат ответа `/auth/history/proxy` — список объектов `{source, iframeUrl, embed, translations, success, updatedAt}`; `embed` = `null` или `{publisherId, type, id}`.

## Review Focus

- API Vibix отдаёт `data-type="serial"`, а SDK документирован с `series` → нормализуем `serial` → `series`.
- `embed_code` пустой, а `iframe_url` есть → Vibix работает как раньше через iframe.
- В query нет `kinopoisk` → эндпоинт отвечает 200 со списком `success: false`, а не 500.
- Один балансер висит/падает → остальные всё равно возвращаются (параллельно, с таймаутом).
- Смена фильма / темы / источника → `<ins>` пересоздаётся (`key`), SDK загружает новый плеер.

---

### Task 1: Разбор `embed_code`

**Files:**
- Create: `backend/utils/embed.py`
- Test: `backend/tests/test_embed.py`

**Interfaces:**
- Produces: `parse_embed_code(code: str | None) -> dict | None` → `{"publisherId": str, "type": str, "id": str}` или `None`, если нет любого из трёх обязательных атрибутов.

- [ ] **Step 1: Тесты**

```python
import unittest
from utils.embed import parse_embed_code

class ParseEmbedCodeTest(unittest.TestCase):
    def test_serial_normalized_to_series(self):
        code = 'data-publisher-id="675412712" data-type="serial" data-id="9126"'
        self.assertEqual(parse_embed_code(code), {"publisherId": "675412712", "type": "series", "id": "9126"})

    def test_movie(self):
        self.assertEqual(parse_embed_code('data-publisher-id="1" data-type="movie" data-id="2"')["type"], "movie")

    def test_full_ins_tag_and_single_quotes(self):
        code = "<ins data-publisher-id='1' data-type='movie' data-id='2'></ins>"
        self.assertEqual(parse_embed_code(code), {"publisherId": "1", "type": "movie", "id": "2"})

    def test_empty_or_incomplete(self):
        self.assertIsNone(parse_embed_code(""))
        self.assertIsNone(parse_embed_code(None))
        self.assertIsNone(parse_embed_code('data-publisher-id="1" data-type="movie"'))
```

- [ ] **Step 2:** `cd backend && python -m unittest tests.test_embed -v` → FAIL (ModuleNotFoundError).
- [ ] **Step 3: Реализация**

```python
import re

_ATTR_RE = re.compile(r"""data-([\w-]+)\s*=\s*["']([^"']*)["']""")
_TYPE_ALIASES = {"serial": "series"}


def parse_embed_code(code: str | None) -> dict | None:
    """Достаёт атрибуты плеера из embed_code Vibix."""
    if not code:
        return None
    attrs = dict(_ATTR_RE.findall(code))
    publisher_id, content_type, content_id = attrs.get("publisher-id"), attrs.get("type"), attrs.get("id")
    if not (publisher_id and content_type and content_id):
        return None
    return {
        "publisherId": publisher_id,
        "type": _TYPE_ALIASES.get(content_type, content_type),
        "id": content_id,
    }
```

- [ ] **Step 4:** тот же запуск → PASS.

### Task 2: Асинхронные балансеры + Vibix embed

**Files:**
- Modify: `backend/services/balance_service.py` (переписать целиком)
- Test: `backend/tests/test_balance_service.py`

**Interfaces:**
- Consumes: `parse_embed_code` из Task 1.
- Produces: `Players(transport: httpx.AsyncBaseTransport | None = None)`; `await Players().get_players(params: dict) -> list[dict]` — всегда 3 элемента в порядке Vibix, Alloha, Collaps, каждый с ключами `source, iframeUrl, embed, translations, success, updatedAt`.

- [ ] **Step 1: Тесты** (через `httpx.MockTransport`; env-переменные конфига выставляются до импорта)

Покрыть: Vibix с `embed_code` → `success`, `embed` разобран, `iframeUrl == ""`; Vibix без `embed_code`, но с `iframe_url` → iframe; Vibix 404 → `success: False`; нет `kinopoisk` → три `success: False` и ни одного HTTP-запроса; Collaps бросает исключение → Vibix и Alloha всё равно успешны.

- [ ] **Step 2:** `python -m unittest tests.test_balance_service -v` → FAIL.
- [ ] **Step 3:** Реализация: `_empty(source)`; каждый `get_*_player(client, kp)` ловит исключения и возвращает `_empty`; `get_players` берёт `params.get("kinopoisk")`, открывает `httpx.AsyncClient(timeout=10)` и отдельный `httpx.AsyncClient(timeout=10, verify=False)` для Alloha, гоняет три запроса через `asyncio.gather`. `print` → `logger`.
- [ ] **Step 4:** все тесты бэка → PASS.

### Task 3: Фронт — SDK и `<ins>` для Vibix

**Files:**
- Modify: `frontend/index.html` (скрипты SDK в `<head>`)
- Create: `frontend/src/VibixEmbed.jsx`
- Modify: `frontend/src/js/player.js:121-123` (фильтр `iframeUrl || embed`)
- Modify: `frontend/src/Player.jsx` (выбор по `source.source`, рендер iframe/embed)

**Interfaces:**
- Consumes: элементы ответа `/proxy` из Task 2.
- Produces: `<VibixEmbed embed={{publisherId, type, id}} darkMode={bool} />`.

- [ ] **Step 1:** `VibixEmbed` рендерит `<ins className="block w-full h-full" data-publisher-id data-type data-id data-width="100%" data-height="100%" data-design={darkMode ? "5" : "1"} />`.
- [ ] **Step 2:** В `Player.jsx` состояние `activeSource` (имя); текущий источник `sources.find(s => s.source === activeSource)`; `embed` → `<VibixEmbed key={`${id}-${darkMode}`} …/>`, иначе `<iframe>`.
- [ ] **Step 3:** `npm run lint` и `npm run build` без ошибок.

### Task 4: Tizen 6 — плееры под серой подложкой

**Files:**
- Modify: `frontend/src/Player.jsx` (классы контейнера `#vibix_union`)

Гипотеза: у предка `<iframe>` стоит `drop-shadow-xl` (CSS `filter`) и `transition-all`. В Chromium 76 (Tizen 6) фильтр на предке заставляет рендерить поддерево в отдельную поверхность; на ТВ видео/iframe рисуются отдельным слоем, и в итоге подложка `bg-zinc-*` оказывается поверх содержимого iframe, а хит-тест продолжает попадать в iframe — «не видно, но кликается». Плюс `id="vibix_union"` совпадает с id, на который ориентируются рекламные скрипты Vibix.

- [ ] **Step 1:** Убрать `drop-shadow-xl` (тень уже даёт `shadow-lg` — `box-shadow`, без фильтра), `transition-all duration-600` → `transition-colors duration-500`, `id="vibix_union"` → `id="player"`.
- [ ] **Step 2:** `npm run build`; проверка на ТВ — вручную пользователем.
