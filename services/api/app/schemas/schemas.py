from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: int
    home_team: str
    away_team: str
    kickoff_time: datetime
    status: str
    attendance: int
    score: str
    class Config:
        from_attributes = True

class GateResponse(BaseModel):
    id: int
    name: str
    capacity: int
    current_flow: int
    status: str
    queue_time_mins: int
    class Config:
        from_attributes = True

class IncidentCreate(BaseModel):
    description: str
    reporter_role: Optional[str] = "volunteer"
    category: Optional[str] = "general"

class IncidentResponse(BaseModel):
    id: int
    description: str
    severity: str
    status: str
    category: str
    reporter_role: str
    ai_summary: Optional[str]
    assigned_dept: Optional[str]
    nearby_resources: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    assigned_dept: Optional[str] = None

class TransportResponse(BaseModel):
    id: int
    mode: str
    destination: str
    status: str
    delay_mins: int
    congestion_level: str
    update_time: datetime
    class Config:
        from_attributes = True

class SustainabilityResponse(BaseModel):
    id: int
    bin_id: str
    bin_type: str
    fill_level: float
    water_usage: float
    power_usage: float
    timestamp: datetime
    class Config:
        from_attributes = True

class AlertCreate(BaseModel):
    message: str
    type: str
    recommended_action: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    message: str
    type: str
    is_active: bool
    recommended_action: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    original_text: str

class AnnouncementResponse(BaseModel):
    id: int
    original_text: str
    english: Optional[str]
    spanish: Optional[str]
    french: Optional[str]
    arabic: Optional[str]
    portuguese: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    role: Optional[str] = "fan"

class ChatResponse(BaseModel):
    response: str
    source: str  # RAG or general model
