from repository.database import async_session_maker
from pydantic import EmailStr
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from core.config import Settings
from utils.password_utils import get_password_hash
import json
import re


class MovieRepository:

    @classmethod
    def extract_kinopoisk_path(cls, url):
        match = re.search(r"https?:\/\/www\.kinopoisk\.ru\/(film|series)\/\d+\/", url)
        return match.group(0)[len("https://www.kinopoisk.ru"):] if match else None
    

    @classmethod
    async def find_title(cls, link: str):
        """Получение истории фильмов пользователя по user_id"""
        async with async_session_maker() as session:  # Создаём асинхронную сессию
            query = text(f"""
                SELECT name, year 
                FROM {Settings.DB_SCHEMA}.library 
                WHERE link = :link
            """)

            result = await session.execute(query, {"link": link})
            row = result.fetchone()

            if not row:
                return None   # Возвращаем пустой список, если история отсутствует

            # Преобразуем SQL-результат в список JSON-совместимых словарей
            title = {"name": f'{row[0]} ({row[1]})'}
            
            return title  # FastAPI автоматически вернёт JSON


    @classmethod
    async def add_movie(cls, user_id: int, data: dict):
        async with async_session_maker() as session:
            query = text("""
                INSERT INTO public.history (user_id, data, last_seen)
                VALUES (:user_id, CAST(:data AS jsonb), NOW())
                ON CONFLICT (user_id, (data::text)) 
                DO UPDATE SET last_seen = NOW();
            """)

            await session.execute(query, {
                "user_id": user_id,
                "data": json.dumps(data)  # 🔥 Сериализуем JSON перед отправкой
            })

            await session.commit()
        

    @classmethod
    async def find_movies_by_user_id(cls, user_id: int):
        """Получение истории фильмов пользователя по user_id"""
        async with async_session_maker() as session:  # Создаём асинхронную сессию
            query = text(f"""
                SELECT id, data, last_seen 
                FROM {Settings.DB_SCHEMA}.history 
                WHERE user_id = :user_id
                ORDER BY last_seen DESC
            """)

            result = await session.execute(query, {"user_id": user_id})
            rows = result.fetchall()

            if not rows:
                return []  # Возвращаем пустой список, если история отсутствует

            # Преобразуем SQL-результат в список JSON-совместимых словарей
            movies = [{"id": row.id, "data": row.data, "last_seen": row.last_seen} for row in rows]
            
            return movies  # FastAPI автоматически вернёт JSON
        


    @classmethod
    async def delete_movie_by_id(cls, history_id: int, user_id: int):
        """Удаление фильма из истории по его id и user_id"""
        async with async_session_maker() as session:
            query = text(f"""
                DELETE FROM {Settings.DB_SCHEMA}.history 
                WHERE id = :history_id and user_id = :user_id
                RETURNING id
            """)

            result = await session.execute(query, {"history_id": history_id, "user_id": user_id})
            deleted_row = result.fetchone()
            
            if not deleted_row:
                raise HTTPException(status_code=404, detail="Фильм не найден в истории")

            await session.commit()  # Подтверждаем удаление

            return {"message": "Фильм успешно удалён", "deleted_id": deleted_row[0]}
        
    
    @classmethod
    async def update_last_seen(cls, user_id: int, data: dict):
        async with async_session_maker() as session:
            query = text("""
                UPDATE public.history
                SET last_seen = NOW()
                WHERE user_id = :user_id AND data = CAST(:data AS jsonb);
            """)
            print(user_id, data)
            await session.execute(query, {
                "user_id": user_id,
                "data": json.dumps(data)  # 🔥 Сериализуем JSON перед отправкой
            })

            await session.commit()

    

    @classmethod
    async def find_movies_by_user_id_last(cls, user_id: int):
        """Получение истории фильмов пользователя по user_id"""
        async with async_session_maker() as session:  # Создаём асинхронную сессию
            query = text(f"""
                SELECT id, data, last_seen 
                FROM {Settings.DB_SCHEMA}.history 
                WHERE user_id = :user_id
                ORDER BY last_seen DESC
            """)

            result = await session.execute(query, {"user_id": user_id})
            row = result.fetchone()

            if not row:
                return None  # Возвращаем пустой список, если история отсутствует

            # Преобразуем SQL-результат в список JSON-совместимых словарей
            movie = {"id": row.id, "data": row.data, "last_seen": row.last_seen}
            
            return movie  # FastAPI автоматически вернёт JSON