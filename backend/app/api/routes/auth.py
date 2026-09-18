from uuid import UUID, uuid4
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.security import create_access_token, get_current_user, AuthenticatedUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Sales Representative"
    company: Optional[str] = "Acme Technologies"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest):
    if not request.email or not request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )
    if "@" not in request.email or len(request.password) < 4:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please provide a valid work email and password."
        )
    
    # Generate deterministic user UUID from email or demo ID
    user_id = UUID("00000000-0000-0000-0000-000000000001")
    token = create_access_token(user_id=user_id, email=request.email, role="authenticated")
    user_name = request.email.split("@")[0].replace(".", " ").title()
    
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": str(user_id),
            "email": request.email,
            "name": user_name,
            "role": "authenticated"
        }
    )


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest):
    if not request.email or not request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )
    if "@" not in request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters."
        )
    
    user_id = uuid4()
    token = create_access_token(user_id=user_id, email=request.email, role="authenticated")
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": str(user_id),
            "email": request.email,
            "name": request.name or "Sales Rep",
            "role": "authenticated"
        }
    )


@router.get("/me")
def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role
    }
