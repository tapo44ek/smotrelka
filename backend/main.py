from fastapi import FastAPI
from api.v1.endpoints.auth_endpoints import router as auth_roter
from api.v1.endpoints.user_endpoints import router as user_router
from api.v1.endpoints.movies_endpoints import router as movie_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(root_path='/auth')

app.include_router(auth_roter)
app.include_router(user_router)
app.include_router(movie_router)

origins = [
    "http://localhost:5173",  # React Dev Server
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)