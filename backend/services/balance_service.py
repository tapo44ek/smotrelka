import asyncio
import logging

import httpx

from core.config import BalancerKeys
from utils.embed import parse_embed_code

logger = logging.getLogger(__name__)

TIMEOUT = 10


def _empty(source: str) -> dict:
    return {
        'source': source,
        'iframeUrl': '',
        'embed': None,
        'translations': [],
        'success': False,
        'updatedAt': []
    }


class Players:

    def __init__(self, transport: httpx.AsyncBaseTransport | None = None):
        # transport подменяется в тестах
        self.transport = transport

    async def get_vibix_player(self, client: httpx.AsyncClient, kinopoisk: str) -> dict:
        result = _empty('Vibix')
        headers = {
            'accept': 'application/json',
            'Authorization': f'Bearer {BalancerKeys.VIBIX_KEY}',
        }

        try:
            response = await client.get(
                f'https://vibix.org/api/v1/publisher/videos/kp/{kinopoisk}',
                headers=headers
            )
            if not response.is_success:
                return result

            data = response.json()
            embed = parse_embed_code(data.get('embed_code'))
            iframe_url = data.get('iframe_url') or ''
            return {
                'source': 'Vibix',
                'iframeUrl': '' if embed else iframe_url,
                'embed': embed,
                'translations': data.get('voiceovers') or [],
                'success': bool(embed or iframe_url),
                'updatedAt': data.get('updated_at')
            }
        except Exception as e:
            logger.warning(f'Vibix error for kp={kinopoisk}: {e!r}')
            return result

    async def get_alloha_player(self, client: httpx.AsyncClient, kinopoisk: str) -> dict:
        result = _empty('Alloha')

        try:
            response = await client.get(
                'https://api.alloha.tv/',
                params={'token': BalancerKeys.ALLOHA_KEY, 'kp': kinopoisk}
            )
            if not response.is_success:
                return result

            data = response.json()['data']
            return {
                **result,
                'iframeUrl': data['iframe'],
                'translations': data['translation_iframe'],
                'success': True
            }
        except Exception as e:
            logger.warning(f'Alloha error for kp={kinopoisk}: {e!r}')
            return result

    async def get_collaps_player(self, client: httpx.AsyncClient, kinopoisk: str) -> dict:
        result = _empty('Collaps')

        try:
            response = await client.get(
                'https://api.bhcesh.me/franchise/details',
                params={'token': BalancerKeys.COLLAPS_KEY, 'kinopoisk_id': kinopoisk}
            )
            if not response.is_success:
                return result

            data = response.json()
            return {
                **result,
                'iframeUrl': data['iframe_url'],
                'success': True
            }
        except Exception as e:
            logger.warning(f'Collaps error for kp={kinopoisk}: {e!r}')
            return result

    async def get_players(self, params: dict) -> list[dict]:
        """search videos from balancers"""
        kinopoisk = params.get('kinopoisk')
        if not kinopoisk:
            return [_empty('Vibix'), _empty('Alloha'), _empty('Collaps')]

        # у Alloha TLS не проверяем намеренно
        async with httpx.AsyncClient(timeout=TIMEOUT, transport=self.transport) as client, \
                httpx.AsyncClient(timeout=TIMEOUT, transport=self.transport, verify=False) as alloha_client:
            vibix, alloha, collaps = await asyncio.gather(
                self.get_vibix_player(client, kinopoisk),
                self.get_alloha_player(alloha_client, kinopoisk),
                self.get_collaps_player(client, kinopoisk),
            )

        return [vibix, alloha, collaps]
