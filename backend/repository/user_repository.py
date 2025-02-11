# app/repository/user_repository.py
from repository.database import async_session_maker
from pydantic import EmailStr
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from core.config import Settings
from utils.password_utils import get_password_hash


class UserRepository:
    @classmethod
    async def find_user_by_email(cls, email: EmailStr) -> dict | None:
        """Find user by email."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT id, email, name 
                FROM {Settings.DB_SCHEMA}.user 
                WHERE email = :email
            """)
            result = await session.execute(query.params(email=email))
            row = result.fetchone()
            return {"user_id": row[0], "email": row[1], "name": row[2]} if row else None


    @classmethod
    async def find_password_by_email(cls, email: EmailStr) -> str | None:
        """Get password hash by email."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT hashed_pass 
                FROM {Settings.DB_SCHEMA}.user 
                WHERE email = :email
            """)
            result = await session.execute(query.params(email=email))
            row = result.fetchone()
            return row[0] if row else None


    @classmethod
    async def does_user_exist(cls, email: EmailStr) -> bool:
        """Check if a user exists by email."""
        async with async_session_maker() as session:
            query = text(f"SELECT 1 FROM {Settings.DB_SCHEMA}.user WHERE email = :email")
            result = await session.execute(query.params(email=email))
            return result.scalar() is not None


    @classmethod
    async def create_user(cls, email: EmailStr, name: str, password: str) -> None:
        """Create a new user."""
        async with async_session_maker() as session:
            query = text(f"""
                INSERT INTO {Settings.DB_SCHEMA}.user (email, name, hashed_pass) 
                VALUES (:email, :name, :password)
            """)
            await session.execute(query.params(email=email, name=name, password=password))
            await session.commit()


    @staticmethod
    async def update_password(email: str, new_password: str) -> None:
        """Update a user's password."""
        async with async_session_maker() as session:
            hashed_password = get_password_hash(new_password)
            query = text(f"""
                UPDATE {Settings.DB_SCHEMA}.user 
                SET hashed_pass = :new_password 
                WHERE email = :email
            """)
            await session.execute(query.params(email=email, new_password=hashed_password))
            await session.commit()


    @classmethod
    async def find_user_data_for_jwt(cls, email: EmailStr) -> dict | None:
        """Get user data needed for JWT payload."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT id, name, email
                FROM {Settings.DB_SCHEMA}.user
                WHERE email = :email
            """)
            result = await session.execute(query.params(email=email))
            row = result.fetchone()
            return {
                "user_id": row[0],
                "name": row[1],
                "email": row[2]
            } if row else None
