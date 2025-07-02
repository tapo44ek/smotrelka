import logging
from fastapi import HTTPException
import requests
from core.config import BalancerKeys

class Players:

    async def get_vibix_player(self, params :dict) -> dict | None:
        base_link = 'https://vibix.org/api/v1/publisher/videos/'
        headers = {
            'accept': 'application/json',
            'Authorization': f'Bearer {BalancerKeys.VIBIX_KEY}',
            'X-CSRF-TOKEN': ''
        }

        if params['kinopoisk']:
            search_link = base_link + 'kp/' + params['kinopoisk']
        
        try:
            if search_link:
                response = requests.get(search_link, headers=headers)
                if response.ok:
                    data = response.json()
                    result = {
                        'source': 'Vibix',
                        'iframeUrl': data['iframe_url'],
                        'translations': data['voiceovers'],
                        'success': True,
                        'updatedAt': data['updated_at']
                    }
                    return result
                else: 
                    return {
                        'source': 'Vibix',
                        'iframeUrl': '',
                        'translations': [],
                        'success': False,
                        'updatedAt': []
                    }
            else: raise HTTPException(status_code=404, detail='search_link is empty')
        except Exception as e: 
            raise HTTPException(status_code=500, detail=f'{str(e)}')
        

    async def get_alloha_player(self, params :dict) -> dict | None:

        result = {
                'source': 'Alloha',
                'iframeUrl': '',
                'translations': [],
                'success': False,
                'updatedAt': []
            }

        if not params['kinopoisk']:
            return  result


        base_link = f'https://api.alloha.tv/?token={BalancerKeys.ALLOHA_KEY}&kp={params["kinopoisk"]}'

        try:
            response = requests.get(base_link)
            print(response)
            if response.ok:
                data = response.json()
                result = {
                    'source': 'Alloha',
                    'iframeUrl': data['data']['iframe'],
                    'translations': data['data']['translation_iframe'],
                    'success': True,
                    'updatedAt': []
                }

            return result
        except Exception as e: 
            raise HTTPException(status_code=500, detail=f'{str(e)}')
        

    async def get_collaps_player(self, params :dict) -> dict | None:

        result = {
                'source': 'Collaps',
                'iframeUrl': '',
                'translations': [],
                'success': False,
                'updatedAt': []
            }

        if not params['kinopoisk']:
            return  result

        base_link = f'https://api.bhcesh.me/franchise/details?token={BalancerKeys.COLLAPS_KEY}&kinopoisk_id={params["kinopoisk"]}'

        try:
            response = requests.get(base_link)
            print(response)
            if response.ok:
                data = response.json()
                print("data.  ", data)
                result = {
                    'source': 'Collaps',
                    'iframeUrl': data['iframe_url'],
                    'translations': [],
                    'success': True,
                    'updatedAt': []
                }
                print(result)

            return result
        except Exception as e: 
            raise HTTPException(status_code=500, detail=f'{str(e)}')



    async def get_players(self, params :dict) -> dict:
        """search videos from balancers"""
        print(params)
        vibix = await self.get_vibix_player(params)
        alloha = await self.get_alloha_player(params)
        collaps = await self.get_collaps_player(params)

        return [vibix, alloha, collaps]
