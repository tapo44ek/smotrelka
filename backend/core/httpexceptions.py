# app/core/httpexceptions.py
from fastapi import HTTPException

class UserNotFoundException(HTTPException):
    def __init__(self, email: str, detail: str = "User not found"):
        detail = f"{detail}: {email}"
        super().__init__(status_code=404, detail=detail)

class InvalidPasswordException(HTTPException):
    def __init__(self, email: str, detail: str = "Invalid password provided"):
        detail = f"{detail} for user: {email}"
        super().__init__(status_code=401, detail=detail)

class JWTException(HTTPException):
    def __init__(self, detail: str = "Invalid or expired token"):
        super().__init__(status_code=401, detail=detail)

class UserAlreadyExistsException(HTTPException):
    def __init__(self, detail: str = "Этот email уже зарегистрирован"):
        super().__init__(status_code=400, detail=detail)

class UserAlreadyExistsLoginException(HTTPException):
    def __init__(self, detail: str = "Этот логин уже зарегистрирован"):
        super().__init__(status_code=400, detail=detail)

class EmailSendException(HTTPException):
    def __init__(self, detail: str = "Password reset email could not be sent. Please contact support."):
        super().__init__(status_code=500, detail=detail)