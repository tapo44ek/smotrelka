from fastapi import APIRouter, HTTPException, Response, Depends, Request
from models.auth import UserLoginShema, UserRegisterShema
from services.user_service import UserService
from core.httpexceptions import (
    UserNotFoundException,
    InvalidPasswordException,
)
from utils.password_utils import get_password_hash
import logging
from JWTs import create_jwt_token, DecodeJWT
from models.user import UserJWTData
from pydantic import EmailStr
from core.httpexceptions import EmailSendException
from repository.user_repository import UserRepository


get_user = DecodeJWT(UserJWTData)

router = APIRouter(prefix="/auth", tags=["Auth"])

logger = logging.getLogger(__name__)

@router.post("/register")
async def register_user(user: UserRegisterShema, response : Response):
    """
    Register user and check of existing 
    """
    try:
        # Хешируем пароль и создаем нового пользователя
        hashed_password = get_password_hash(user.password)
        user_service = UserService()
        await user_service.register_user(name=user.name, email=user.email, password=hashed_password)

        # Возвращаем успешный ответ или токен
        return {"message": "User created successfully!"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/change_password")
async def register_user(request : Request, user=Depends(get_user)):
    """
    Register user and check of existing 
    """
    try:
        # Хешируем пароль и создаем нового пользователя
        # hashed_password = get_password_hash(user.password)
        user_service = UserService()
        body = await request.json()

        await user_service.change_password(email=user.email, 
                                           old_password=body["current_password"], 
                                           new_password=body["new_password"], 
                                           confirm_password=body["new_password"])

        # Возвращаем успешный ответ или токен
        return {"message": "User created successfully!"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", summary="Авторизация пользователя")
async def login_user(response: Response, user: UserLoginShema):
    """
    Logining user and create JWT
    """
    try:
        logger.info(f"Authorization user: {user.email}")
        
        # Проверка валидности пользователя
        user_service = UserService()
        is_valid_user = await user_service.validate_user(email=user.email, password=user.password)
        if not is_valid_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if "@" not in user.email:
            user.email = await UserRepository.find_email_by_login(name=user.email)

        # Получение данных для JWT
        user_data = await user_service.get_user_data_for_jwt(email=user.email)
        
        # Генерация токена
        token = await create_jwt_token(user_data)
        
        # Установка токена в куки
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=False,
            max_age=60*60*24*90,
            samesite="Lax",
            secure=False,
            path='/'
        )
        return {"access_token": token}
    except UserNotFoundException as e:
        logger.warning(f"Пользователь не найден: {e.detail}")
        raise HTTPException(status_code=404, detail="User not found")
    except InvalidPasswordException as e:
        logger.warning(f"Неверный пароль для пользователя: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid password")
    except Exception as e:
        logger.error(f"Ошибка авторизации: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/reset_password")
async def reset_password(data: dict):
    """
    Endpoint to reset a user's password.
    """
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    user_service=UserService()
    try:
        await user_service.reset_password(email=email)
        logger.info(f"Password reset successfully for email: {email}")
        return {"message": "Password reset successfully. Check your email for the new password."}
    except UserNotFoundException as e:
        logger.error(f"Password reset failed: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except EmailSendException as e:
        logger.error(f"Email sending failed: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except Exception as e:
        logger.error(f"Unexpected error during password reset for email {email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
    
@router.post("/qr_login/create", summary="Авторизация пользователя")
async def login_user(response: Response):
    """
    Logining user and create JWT
    """
    try:
        
        # Проверка валидности пользователя
        user_service = UserService()
        row = await user_service.create_qr_login()
        print(row)
       
        return {"uid": str(row[0])}
    except Exception as e:
        logger.error(f"Ошибка: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@router.post("/qr_login/approve", summary="Авторизация пользователя")
async def login_user(response: Response, qr_uuid: str, user = Depends(get_user)):
    """
    Logining user and create JWT
    """
    try:
        
        # Проверка валидности пользователя
        print(user.user_id)
        token = await create_jwt_token({"user_id": user.user_id, "email": user.email})
        print(token)
        user_service = UserService()
        result = await user_service.approve_qr_login(qr_uuid, token)
        # row = await user_service.approve_qr_login()
        # print(row)
        print(result)
       
        return {"uuid": result[0]}
    except Exception as e:
        logger.error(f"Ошибка: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@router.get("/qr_login/check_approve", summary="Авторизация пользователя")
async def login_user(response: Response, qr_uuid: str):
    """
    Logining user and create JWT
    """
    try:
        # Проверка валидности пользователя
        user_service = UserService()
        row = await user_service.check_qr_login(qr_uuid)
        if not row:
            raise HTTPException(status_code=404, detail=f"Qr code is not found in memory")
        if row[0]:
        # Установка токена в куки
            response.set_cookie(
                key="access_token",
                value=row[0],
                httponly=False,
                max_age=60*60*24*90,
                samesite="Lax",
                secure=False,
                path='/'
            )
            print('yeeeeh')
            await user_service.clear_qr_login(qr_uuid)
            return {"status": "approved"}
        print(row[0])
        return {"status": "pending"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Ошибка: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")