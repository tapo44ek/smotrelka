import bcrypt
import string
import random

def get_password_hash(password: str) -> str:
    """
    Get password hash.
    bcrypt generates a random salt internally.
    """
    salt = bcrypt.gensalt()  
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def validate_password(provided_password: str, stored_hash: str) -> bool:
    """
    Validate password.
    Compares provided password with the stored hashed password.
    """
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_hash.encode('utf-8'))

# Функция для генерации нового пароля
def generate_new_password(length=12):
    """Генерация нового пароля с заданной длиной"""
    all_characters = string.ascii_letters + string.digits + string.punctuation
    new_password = ''.join(random.choice(all_characters) for _ in range(length))
    return new_password


def validate_password_strength(password: str):
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not any(char.isdigit() for char in password):
        raise ValueError("Password must contain at least one digit.")
    if not any(char.isupper() for char in password):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not any(char.islower() for char in password):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not any(char in string.punctuation for char in password):
        raise ValueError("Password must contain at least one special character.")
