from fastapi import APIRouter, HTTPException, Depends, Request, Response
import json
from services.user_service import UserService
from services.balance_service import Players
import logging
from JWTs import DecodeJWT
from models.user import UserJWTData
from repository.movie_repository import MovieRepository
from utils.movies import get_title_api
import re
import httpx
from urllib.parse import urlencode

get_user = DecodeJWT(UserJWTData)

router = APIRouter(prefix="/history", tags=["history"])

logger = logging.getLogger(__name__)

@router.post("/add")
async def add_movie(
    request: Request,
    user = Depends(get_user)
):
    """
    Endpoint to change the password of the authenticated user.
    """

    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Отсутствует access_token")

    print(user)
    body = await request.json()
    print(body)
    try:
        response = await MovieRepository.add_movie(
            user_id=user.user_id,
            data=body
        )
        return response
    except HTTPException as e:
        logger.error(f"Password change failed for user {user.email}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during password change for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
    

@router.post("/remove")
async def remove_movie(
    request: Request,
    user = Depends(get_user)
):
    """
    Endpoint to change the password of the authenticated user.
    """

    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Отсутствует access_token")

    print(user)
    body = await request.json()

    if "id" not in body:
        raise HTTPException(status_code=400, detail="Missing 'id' in request body")
    
    print(body)
    try:
        response = await MovieRepository.delete_movie_by_id(
            user_id=user.user_id,
            history_id=body["id"]
        )
        return response
    except HTTPException as e:
        logger.error(f"Password change failed for user {user.email}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during password change for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
    
    

@router.get("/hist")
async def get_movies(
    user = Depends(get_user)
):
    """
    Endpoint to change the password of the authenticated user.
    """

    try:
        response = await MovieRepository.find_movies_by_user_id(
            user_id=user.user_id
        )
        # print(response)
        return response
    except HTTPException as e:
        logger.error(f"Password change failed for user {user.email}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during password change for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
    

@router.get("/proxy")
async def proxy(request: Request):
    base_url = "https://p.ddbb.lol/api/players"
    player = Players()
    # Собираем все query-параметры
    query = dict(request.query_params)
    query_string = urlencode(query, doseq=True)
    vibix = await player.get_players(query)
    print(f"query = {query}")
    # logger.log("query = " + query)
    print(f"vibix = {vibix}")
    # Собираем итоговый URL
    full_url = f"{base_url}?{query_string}"

    try:
        async with httpx.AsyncClient() as client:
            proxied_response = await client.get(full_url, headers={
                "User-Agent": request.headers.get("user-agent", "Mozilla")
            })
        # print(proxied_response.content)
        # print(type(proxied_response.content))
        response = proxied_response.json()
        filtered = [item for item in response if item.get("source") not in {"Turbo", "Vibix", "Alloha"}]
        for item in vibix:
            filtered.append(item)

        print(vibix)

        json_data = json.dumps(filtered).encode("utf-8")
        return Response(
            content=json_data,
            status_code=proxied_response.status_code,
            media_type=proxied_response.headers.get("content-type", "application/json"),
            headers={"Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")


@router.get("/last")
async def get_movies_last(
    user = Depends(get_user)
):
    """
    Endpoint to change the password of the authenticated user.
    """

    try:
        response = await MovieRepository.find_movies_by_user_id_last(
            user_id=user.user_id
        )
        # print(response)
        if response == None:
            response = {'title':"empty_list"}
            # print(response)
        return response
    except HTTPException as e:
        logger.error(f"Password change failed for user {user.email}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during password change for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
    

@router.post("/fetch_movie")
async def find_title(
    request: Request,
    user = Depends(get_user)
):
    """
    Endpoint to change the password of the authenticated user.
    """

    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Отсутствует access_token")

    print(user)
    body = await request.json()

    if "url" not in body:
        raise HTTPException(status_code=400, detail="Missing 'id' in request body")
    print(body["url"])
    link = MovieRepository.extract_kinopoisk_path(body["url"])
    link = link + '/' if not link.endswith('/') else link
    print(link)
    print(body)
    try:
        response = await MovieRepository.find_title(
            link=link
        )
        print(response)
        if response == None:
            pattern = r"/(?:film|series)/(\d+)/"
            match = re.search(pattern, link)

            if match:
                id = match.group(1)
                print(id)
                title, year = await get_title_api(int(id))
                print(title)

                a = await MovieRepository.add_title({"link": link, "name": title, "year": year})

                response = {"name": f"{title} ({year})"}

            else:
                raise HTTPException(status_code=404, detail="No title found.")
        
        return response
    except HTTPException as e:
        logger.error(f"Password change failed for user {user.email}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during password change for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
    

@router.post("/last_seen")
async def update_last_seen(
    request: Request,
    user = Depends(get_user)
):
    """
    Endpoint to change the password of the authenticated user.
    """

    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Отсутствует access_token")

    print(user)
    body = await request.json()
    print(body)
    try:
        response = await MovieRepository.update_last_seen(
            user_id=user.user_id,
            data=body
        )
        return response
    except HTTPException as e:
        logger.error(f"Password change failed for user {user.email}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during password change for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")