import os
import unittest

for _key in ("DB_HOST", "DB_PORT", "DB_USER", "DB_PASS", "DB_NAME", "DB_SCHEMA",
             "ALGORITHM", "SECRET_KEY", "EMAIL_SENDER", "EMAIL_PASSWORD",
             "EMAIL_SERVER", "EMAIL_PORT", "EMAIL_LOGIN", "X_API_KEY",
             "VIBIX_KEY", "ALLOHA_KEY", "COLLAPS_KEY"):
    os.environ.setdefault(_key, "test")

import httpx

from services.balance_service import Players

VIBIX_OK = {
    "iframe_url": "",
    "embed_code": 'data-publisher-id="675412712" data-type="serial" data-id="9126"',
    "voiceovers": [{"id": 72, "name": "Light Breeze"}],
    "updated_at": "2026-10-07 09:37:20",
}
ALLOHA_OK = {"data": {"iframe": "https://alloha/1", "translation_iframe": {"1": {}}}}
COLLAPS_OK = {"iframe_url": "https://collaps/1"}


def make_handler(vibix=(200, VIBIX_OK), alloha=(200, ALLOHA_OK), collaps=(200, COLLAPS_OK)):
    calls = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        host = request.url.host
        if host == "vibix.org":
            status, body = vibix
        elif host == "api.alloha.tv":
            status, body = alloha
        else:
            status, body = collaps
        if isinstance(body, Exception):
            raise body
        return httpx.Response(status, json=body)

    return handler, calls


def by_source(result):
    return {item["source"]: item for item in result}


class GetPlayersTest(unittest.IsolatedAsyncioTestCase):
    async def run_players(self, handler, params=None):
        players = Players(transport=httpx.MockTransport(handler))
        return await players.get_players(params if params is not None else {"kinopoisk": "13746045"})

    async def test_vibix_embed(self):
        handler, calls = make_handler()
        result = await self.run_players(handler)

        self.assertEqual([item["source"] for item in result], ["Vibix", "Alloha", "Collaps"])
        vibix = result[0]
        self.assertTrue(vibix["success"])
        self.assertEqual(vibix["iframeUrl"], "")
        self.assertEqual(vibix["embed"], {"publisherId": "675412712", "type": "series", "id": "9126"})
        self.assertEqual(vibix["translations"], VIBIX_OK["voiceovers"])
        vibix_request = next(r for r in calls if r.url.host == "vibix.org")
        self.assertEqual(vibix_request.url.path, "/api/v1/publisher/videos/kp/13746045")
        self.assertEqual(vibix_request.headers["Authorization"], "Bearer test")

    async def test_vibix_falls_back_to_iframe(self):
        handler, _ = make_handler(vibix=(200, {**VIBIX_OK, "embed_code": "", "iframe_url": "https://vibix/1"}))
        vibix = (await self.run_players(handler))[0]

        self.assertTrue(vibix["success"])
        self.assertIsNone(vibix["embed"])
        self.assertEqual(vibix["iframeUrl"], "https://vibix/1")

    async def test_vibix_without_player(self):
        handler, _ = make_handler(vibix=(200, {**VIBIX_OK, "embed_code": "", "iframe_url": ""}))
        self.assertFalse((await self.run_players(handler))[0]["success"])

    async def test_vibix_not_found(self):
        handler, _ = make_handler(vibix=(404, {"message": "not found"}))
        vibix = (await self.run_players(handler))[0]
        self.assertFalse(vibix["success"])
        self.assertIsNone(vibix["embed"])

    async def test_other_balancers(self):
        handler, _ = make_handler()
        result = by_source(await self.run_players(handler))

        self.assertEqual(result["Alloha"]["iframeUrl"], "https://alloha/1")
        self.assertTrue(result["Alloha"]["success"])
        self.assertEqual(result["Collaps"]["iframeUrl"], "https://collaps/1")
        self.assertTrue(result["Collaps"]["success"])

    async def test_no_kinopoisk(self):
        for params in ({}, {"kinopoisk": ""}):
            handler, calls = make_handler()
            result = await self.run_players(handler, params)

            self.assertEqual(len(result), 3)
            self.assertTrue(all(not item["success"] for item in result))
            self.assertEqual(calls, [])

    async def test_failing_balancer_does_not_break_others(self):
        handler, _ = make_handler(collaps=(200, httpx.ConnectTimeout("timeout")))
        result = by_source(await self.run_players(handler))

        self.assertFalse(result["Collaps"]["success"])
        self.assertTrue(result["Vibix"]["success"])
        self.assertTrue(result["Alloha"]["success"])

    async def test_alloha_error_response(self):
        handler, _ = make_handler(alloha=(500, {"error": "boom"}))
        self.assertFalse(by_source(await self.run_players(handler))["Alloha"]["success"])


if __name__ == "__main__":
    unittest.main()
