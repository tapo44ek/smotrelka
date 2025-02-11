from pydantic import BaseModel, EmailStr
from datetime import datetime

class MoviesLibrary(BaseModel):
    link: str
    name: str
    year: str

class MoviesHistory(BaseModel):
    data: str
    user_id: int
    created_at: datetime

