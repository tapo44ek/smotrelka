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
                    result = {
                        'source': 'Vibix',
                        'iframeUrl': '',
                        'translations': [],
                        'success': True,
                        'updatedAt': []
                    }
            else: raise HTTPException(status_code=404, detail='search_link is empty')
        except Exception as e: 
            raise HTTPException(status_code=500, detail=f'{str(e)}')


        



    async def get_players(self, params :dict) -> dict:
        """search videos from balancers"""
        print(params)
        balancers_available = ["Vibix"]

        return await self.get_vibix_player(params)
