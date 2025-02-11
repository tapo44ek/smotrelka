from pydantic import BaseModel, EmailStr


class UserLoginShema(BaseModel):
    email: EmailStr
    password: str


class UserRegisterShema(BaseModel):
    email: EmailStr
    name: str
    password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr