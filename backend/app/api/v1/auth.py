from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Optional
from datetime import timedelta
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.db import get_session
from app.models.user import User, UserCreate
from app.schemas.user import UserCreate as UserCreateSchema, UserRead, Token
from app.services.user import create_user, get_user_by_email
from .deps import get_current_user


auth_router = APIRouter()


@auth_router.post("/register", response_model=UserRead)
def register_user(user_create: UserCreateSchema, session: Session = Depends(get_session)):
    # Check if user already exists
    existing_user = get_user_by_email(session=session, email=user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create the user using the service function
    db_user = create_user(session=session, user_create=user_create)

    return db_user


@auth_router.post("/login", response_model=Token)
def login_user(user_credentials: UserCreateSchema, session: Session = Depends(get_session)):
    # Get user by email
    user = get_user_by_email(session=session, email=user_credentials.email)
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user