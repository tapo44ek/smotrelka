import re

_ATTR_RE = re.compile(r"""data-([\w-]+)\s*=\s*["']([^"']*)["']""")

# API Vibix отдаёт "serial", а SDK документирован с "series"
_TYPE_ALIASES = {"serial": "series"}


def parse_embed_code(code: str | None) -> dict | None:
    """Достаёт атрибуты плеера из embed_code Vibix."""
    if not code:
        return None

    attrs = dict(_ATTR_RE.findall(code))
    publisher_id = attrs.get("publisher-id")
    content_type = attrs.get("type")
    content_id = attrs.get("id")
    if not (publisher_id and content_type and content_id):
        return None

    return {
        "publisherId": publisher_id,
        "type": _TYPE_ALIASES.get(content_type, content_type),
        "id": content_id,
    }
