from fastapi import APIRouter, HTTPException, Depends
from services.user_service import UserService
import logging
from JWTs import DecodeJWT
from models.user import UserJWTData

# get_user = DecodeJWT(UserJWTData)

router = APIRouter(prefix="/user", tags=["User"])

logger = logging.getLogger(__name__)

@router.post("/change_password")
async def change_password(
    old_password: str,
    new_password: str,
    confirm_password: str,
    user: UserJWTData = Depends(DecodeJWT(UserJWTData))
):
    """
    Endpoint to change the password of the authenticated user.
    """
    try:
        response = await UserService.change_password(
            email=user.email,
            old_password=old_password,
            new_password=new_password,
            confirm_password=confirm_password
        )
        return response
    except HTTPException as e:
        logger.error(f"Password change failed for user {user.email}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during password change for user {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again later.")
    
@router.get('/test')
async def test(user = Depends(DecodeJWT(UserJWTData))):
    return user