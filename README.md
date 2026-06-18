# [smotrelka.space](https://smotrelka.space/) Online Cinema


Smotrelka is a custom online cinema backend designed to power a modern movie platform with user authentication, password management, and QR‑code based login flows, plus a separate frontend for the user interface. It is built on top of FastAPI and a modular architecture that separates APIs, domain models, services, repositories, and utilities.

> **Important note on content and piracy**  
> Smotrelka is intended for legal use only. It is designed to work with legitimately acquired and licensed content. Piracy is harmful to creators and the film industry, and this project does **not** endorse, encourage, or support any form of copyright infringement or illegal distribution of media.

> **Important note on payments and balance**  
> Smotrelka, in its current form, does **not** implement any payment processing, billing, or user balance functionality. If you build payment features on top of this project, you are solely responsible for implementing them securely, legally, and in compliance with all regulations.

---

## Concept and goals

Smotrelka acts as the backend core for an online cinema: it manages users, their credentials, and access tokens, and exposes an HTTP API that can be used by web, mobile, or TV clients. One of the key features is a QR‑code based login flow that allows users to authorize sessions on devices (for example, a TV or another browser) by scanning a QR code from a trusted device.

The main goals of Smotrelka are:

- Provide a clean and extensible backend for an online cinema  
- Demonstrate modern FastAPI‑based architecture and JWT authentication patterns  
- Offer a realistic base for experiments, learning, or building a legal movie service  

---

## Repository structure

At the root level, the repository separates backend and frontend code.

```text
smotrelka/
  backend/      # FastAPI backend (APIs, models, services, repositories, utils)
  frontend/     # Frontend application consuming the backend API
  LICENSE
  README.md
```

- The **backend** directory contains the FastAPI application and all business logic.  
- The **frontend** directory contains the user‑facing interface, which communicates with the backend through HTTP endpoints.  

This structure allows you to develop and deploy backend and frontend independently while keeping them in a single repository.

---

## Backend architecture

The backend follows a layered structure to keep concerns separated and the codebase maintainable.

```text
backend/
  main.py       # FastAPI app entry point
  api/          # HTTP API (versioned routes and endpoints)
  core/         # core config and shared infrastructure
  models/       # domain and data models
  repository/   # data access layer
  services/     # business logic and orchestration
  utils/        # helpers and shared utilities
  requirements.txt
```

### Entry point

- `main.py` initializes the FastAPI application, sets up routing, and prepares the app to be served by an ASGI server such as Uvicorn.  

### API layer

- `api/` contains the HTTP API interface grouped by version (e.g. `api/v1`).  
- Under `api/v1/endpoints`, individual modules are responsible for specific areas of functionality.  

In particular, `auth_endpoints.py` implements registration, login, password reset, and QR‑code login flows.

### Core, models, repository, services

- `core/` collects application configuration and shared primitives such as HTTP exception types used across the project.  
- `models/` holds Pydantic models that define input/output schemas and JWT payload structures (for example, `UserLoginShema`, `UserRegisterShema`, and `UserJWTData`).  
- `repository/` encapsulates data access operations; for instance, `UserRepository` provides helper methods like finding an email by login name.  
- `services/` contains higher‑level business logic; `UserService` implements user registration, validation, password change, password reset, and QR‑login related operations.  

### Utilities

- `utils/` provides shared helper functions, including password hashing and verification via utilities like `get_password_hash` and related password tools.  

---

## Authentication and authorization

Smotrelka’s authentication is built around JWT tokens and cookies. Tokens are generated and verified using a dedicated JWT module and Pydantic‑based payload models.

Key components:

- `JWTs.create_jwt_token` — creates JWT tokens based on user data, used for normal and QR‑based login flows.  
- `JWTs.DecodeJWT(UserJWTData)` — returns a dependency that reads and validates JWT from incoming requests, yielding a strongly typed user object (`user = Depends(get_user)`).  

### Registration

`POST /auth/register` registers a new user.

- Input: `UserRegisterShema` (name, email, password).  
- The password is hashed using `get_password_hash` before being stored.  
- On success, returns a simple success message:

```json
{
  "message": "User created successfully!"
}
```

### Login

`POST /auth/login` authenticates an existing user and issues a JWT token stored both in the response and as a cookie.

Flow:

1. Validate credentials via `UserService.validate_user(email, password)`.  
2. If the login field does not contain `@`, resolve it to an email using `UserRepository.find_email_by_login(name)`.  
3. Fetch user data for JWT via `UserService.get_user_data_for_jwt(email)`.  
4. Generate a JWT with `create_jwt_token`.  
5. Set the token as a cookie (`access_token`) with a long‑lived expiration (90 days) and return it in the response body.  

Example response:

```json
{
  "access_token": "<jwt-token>"
}
```

Cookies are configured with `httponly=False`, `samesite="Lax"`, and `secure=False` by default.

### Change password

`POST /auth/change_password` allows an authenticated user to change their password.

- Requires a valid JWT (user extracted using `Depends(get_user)`).  
- Expects a JSON body with `current_password` and `new_password`.  
- Uses `UserService.change_password` to perform validation and update.  

### Reset password

`POST /auth/reset_password` triggers a password reset by email.

- Input: JSON object containing `email`.  
- Uses `UserService.reset_password(email)` to generate a new password and send it via email.  
- Handles errors like user not found (`UserNotFoundException`) and email sending issues (`EmailSendException`) with proper HTTP status codes.  

---

## QR‑code login flow

A distinctive feature of Smotrelka is the QR‑code based login flow implemented in `auth_endpoints.py`. It allows one device to initiate a login session via a QR code and another (already authenticated) device to approve it.

There are three main endpoints:

1. `POST /auth/qr_login/create`  
2. `GET  /auth/qr_login/approve`  
3. `GET  /auth/qr_login/check_approve`  

### 1. Create QR login session

`POST /auth/qr_login/create` creates a new QR login session and returns a unique identifier.

- Calls `UserService.create_qr_login()` to allocate a new QR login entry (for example, stored in a database or in‑memory storage).  
- Returns a JSON payload with the unique identifier:

```json
{
  "uid": "<qr-login-uuid>"
}
```

This `uid` can be embedded into a QR code (for example, as a URL containing the UUID).

### 2. Approve QR login

`GET /auth/qr_login/approve` is called from an already authenticated device.

- Requires a valid JWT (user injected via `Depends(get_user)`).  
- Receives `qr_uuid` as a query parameter.  
- Generates a JWT token that includes the user’s ID and email: `create_jwt_token({"user_id": user.user_id, "email": user.email})`.  
- Calls `UserService.approve_qr_login(qr_uuid, token)` to mark the QR login session as approved and associate the token with it.  
- Returns the `uuid` of the approved session:

```json
{
  "uuid": "<qr-login-uuid>"
}
```

### 3. Check QR login status and finalize login

`GET /auth/qr_login/check_approve` is typically called by the device that displayed the QR code.

- Receives `qr_uuid` as a query parameter.  
- Uses `UserService.check_qr_login(qr_uuid)` to retrieve the stored token or status.  
- If the QR UUID is not found, raises `HTTPException(404, "Qr code is not found in memory")`.  
- If the stored token is present (`row[0]` truthy), it:  
  - Sets the `access_token` cookie with the stored JWT.  
  - Calls `UserService.clear_qr_login(qr_uuid)` to clean up the session.  
  - Returns:

```json
{
  "status": "approved"
}
```

- If there is no token yet, returns:

```json
{
  "status": "pending"
}
```

This polling‑style flow allows the “QR device” to periodically check whether the login has been approved from a trusted device.

---

## Technology stack

Smotrelka’s backend environment is based on Python and FastAPI, with supporting libraries installed in a dedicated virtual environment (`backend/.venv`).

Key technologies:

- **FastAPI** — high‑performance web framework used for defining routes, dependencies, and request/response models.  
- **Pydantic** — strongly typed models for request validation and JWT payload definitions.  
- **SQLAlchemy** — ORM and database toolkit for persistence, visible in the virtual environment packages.  
- **JWT libraries** — used for signing and verifying authentication tokens (`PyJWT`, custom `JWTs` package).  
- **Uvicorn** — ASGI server used to serve the FastAPI application.  

The presence of `requirements.txt` in the backend directory indicates that dependencies are managed explicitly for reproducible setups.

---

## Installation and setup

### Prerequisites

- Python 3.10+  
- A database configured according to your models and repository layer  
- Node.js (if you plan to build and run the frontend from `frontend/`)  

### Clone the repository

```bash
git clone https://github.com/<your-org>/smotrelka.git
cd smotrelka
```

### Backend environment

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Linux/macOS
# .venv\Scripts\activate        # Windows PowerShell or cmd
pip install -r requirements.txt
```

Configure environment variables (for example, database connection, JWT secrets, mail settings) via `.env` in `backend/` or your preferred method.

### Run the backend

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`, and you can access interactive docs (Swagger UI) at `http://localhost:8000/docs` if enabled.

### Frontend

The `frontend/` directory contains the UI project that consumes the backend API. A typical setup might look like:

```bash
cd frontend
npm install
npm run dev
```

Configure the frontend to talk to the backend base URL (for example, `http://localhost:8000`).

---

## Example API usage

### Register user

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Alice",
        "email": "alice@example.com",
        "password": "StrongPassword123"
      }'
```

### Login user

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
        "email": "alice@example.com",
        "password": "StrongPassword123"
      }'
```

### Create QR login session

```bash
curl -X POST http://localhost:8000/auth/qr_login/create
```

### Approve QR login (from authorized device)

```bash
curl -X GET "http://localhost:8000/auth/qr_login/approve?qr_uuid=<qr-login-uuid>" \
  -H "Cookie: access_token=<your-existing-token>"
```

### Check QR login status (from QR device)

```bash
curl -X GET "http://localhost:8000/auth/qr_login/check_approve?qr_uuid=<qr-login-uuid>" \
  -c cookies.txt
```

---

## Legal and ethical use

Smotrelka is a technical platform. It does not ship with any movies, media files, or links to copyrighted content in the repository.

- You must only use it with legally obtained and properly licensed content.  
- You are responsible for respecting copyright law and the terms of use of any third‑party services you integrate.  
- Using this software to organize, automate, or facilitate piracy is explicitly against its purpose and not supported by the author.  

By using Smotrelka, you agree to build services that respect creators’ rights and support the film ecosystem.

---

## License

This project is distributed under the terms specified in the [`LICENSE`](LICENSE) file in the repository root.
