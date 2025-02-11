from pydantic import BaseModel, ConfigDict, EmailStr


class UserJWTData(BaseModel):
    user_id: int
    email: EmailStr
    exp: int

    model_config = ConfigDict(from_attributes=True)