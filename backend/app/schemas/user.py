from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserOut(UserBase):
    id: int
    role: str
    auth_provider: str = "local"
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleAuthUrlOut(BaseModel):
    authorization_url: str
    configured: bool = True


class GoogleAuthStatusOut(BaseModel):
    configured: bool
    redirect_uri: str
    google_client_id_present: bool = False
    google_client_secret_present: bool = False
    google_redirect_uri_present: bool = False
    env_files_detected: List[str] = Field(default_factory=list)


class GoogleTicketExchangeRequest(BaseModel):
    ticket: str = Field(..., min_length=10, max_length=2000)
