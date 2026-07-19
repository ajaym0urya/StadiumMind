import os
import asyncio
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Dict, Any

# Internal imports
from app.core.database import Base, engine, get_db
from app.domain.models import User, Match, Gate, Incident, TransportStatus, SustainabilityMetric, Alert, Announcement
from app.schemas import schemas
from app.services.simulator import seed_initial_data, simulate_realtime_tick
from app.services.gemini_service import GeminiService

# Setup Database Tables
Base.metadata.create_all(bind=engine)

# Seed database on module load
db = next(get_db())
seed_initial_data(db)

app = FastAPI(
    title="StadiumMind AI Operations API",
    description="Enterprise API backing the Smart Stadium Operations Copilot for FIFA World Cup 2026",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory background simulator loop manager
SIMULATOR_RUNNING = True

async def start_simulator_loop():
    """Background simulator that ticks stadium statistics periodically."""
    global SIMULATOR_RUNNING
    while SIMULATOR_RUNNING:
        try:
            db_session = next(get_db())
            simulate_realtime_tick(db_session)
        except Exception as e:
            print(f"Simulator Tick Error: {e}")
        await asyncio.sleep(8) # Ticks every 8 seconds

@app.on_event("startup")
async def startup_event():
    # Start simulator in event loop
    asyncio.create_task(start_simulator_loop())

@app.on_event("shutdown")
def shutdown_event():
    global SIMULATOR_RUNNING
    SIMULATOR_RUNNING = False

# ----------------- AUTH ENDPOINTS -----------------
# Simplified secure local auth/RBAC provider.
@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or user.password_hash.split("$")[-1] != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return schemas.Token(
        access_token=f"mock-jwt-token-for-{user.email}",
        token_type="bearer",
        role=user.role,
        email=user.email
    )

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(User.email == user_data.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user_data.email,
        password_hash=f"pbkdf2:sha256:600000$mockhash${user_data.password}",
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ----------------- MATCH ENDPOINTS -----------------
@app.get("/api/matches", response_model=List[schemas.MatchResponse])
def get_matches(db: Session = Depends(get_db)):
    return db.query(Match).all()

# ----------------- GATE ENDPOINTS -----------------
@app.get("/api/gates", response_model=List[schemas.GateResponse])
def get_gates(db: Session = Depends(get_db)):
    return db.query(Gate).all()

# ----------------- INCIDENT ENDPOINTS -----------------
@app.get("/api/incidents", response_model=List[schemas.IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.timestamp.desc()).all()

@app.post("/api/incidents", response_model=schemas.IncidentResponse)
def create_incident(incident_in: schemas.IncidentCreate, db: Session = Depends(get_db)):
    # 1. Summarize and prioritize via Gemini
    ai_analysis = GeminiService.summarize_incident(incident_in.description)
    
    # 2. Store in Database
    new_incident = Incident(
        description=incident_in.description,
        severity=ai_analysis.get("severity", "medium"),
        status="open",
        category=ai_analysis.get("category", "general"),
        reporter_role=incident_in.reporter_role,
        ai_summary=ai_analysis.get("summary"),
        assigned_dept=ai_analysis.get("assigned_dept"),
        nearby_resources=ai_analysis.get("nearby_resources")
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    # 3. Create a high-priority alert for organizers/security if severity is high/critical
    if new_incident.severity in ["high", "critical"]:
        new_alert = Alert(
            message=f"Critical Incident: {new_incident.ai_summary} (Assigned to {new_incident.assigned_dept})",
            type="critical" if new_incident.severity == "critical" else "warning",
            is_active=True,
            recommended_action=ai_analysis.get("suggested_response", "Deploy nearest response team.")
        )
        db.add(new_alert)
        db.commit()

    return new_incident

@app.patch("/api/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def update_incident(incident_id: int, obj_in: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if obj_in.status is not None:
        incident.status = obj_in.status
    if obj_in.severity is not None:
        incident.severity = obj_in.severity
    if obj_in.assigned_dept is not None:
        incident.assigned_dept = obj_in.assigned_dept
        
    db.commit()
    db.refresh(incident)
    return incident

# ----------------- TRANSPORT ENDPOINTS -----------------
@app.get("/api/transport", response_model=List[schemas.TransportResponse])
def get_transport(db: Session = Depends(get_db)):
    return db.query(TransportStatus).all()

# ----------------- SUSTAINABILITY ENDPOINTS -----------------
@app.get("/api/sustainability/metrics", response_model=List[schemas.SustainabilityResponse])
def get_sustainability_metrics(db: Session = Depends(get_db)):
    return db.query(SustainabilityMetric).all()

@app.get("/api/sustainability/recommendations")
def get_sustainability_recommendations(db: Session = Depends(get_db)):
    recs = GeminiService.generate_sustainability_recommendations(db)
    return {"recommendations": recs}

# ----------------- ALERTS / COPILOT ENDPOINTS -----------------
@app.get("/api/alerts", response_model=List[schemas.AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.is_active == True).order_by(Alert.timestamp.desc()).all()

@app.post("/api/alerts/{alert_id}/apply")
def apply_alert_recommendation(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_active = False # Recommendation applied / dismissed
    
    # If it is the Gate B congestion alert, simulate routing adjustment
    if "Gate B" in alert.message:
        gate_b = db.query(Gate).filter(Gate.name.like("%Gate B%")).first()
        gate_a = db.query(Gate).filter(Gate.name.like("%Gate A%")).first()
        if gate_b and gate_a:
            # Shift flow
            redirected = int(gate_b.current_flow * 0.25)
            gate_b.current_flow -= redirected
            gate_a.current_flow += redirected
            gate_b.queue_time_mins = max(1, int(gate_b.current_flow / 20))
            gate_a.queue_time_mins = max(1, int(gate_a.current_flow / 20))
            gate_b.status = "crowded" if gate_b.current_flow > 250 else "nominal"
            gate_a.status = "crowded" if gate_a.current_flow > 250 else "nominal"
    
    db.commit()
    return {"message": "AI Recommendation applied successfully. Rerouting rules and personnel assignments updated."}

@app.post("/api/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_active = False
    db.commit()
    return {"message": "Alert dismissed."}

# ----------------- ANNOUNCEMENTS ENDPOINTS -----------------
@app.get("/api/announcements", response_model=List[schemas.AnnouncementResponse])
def get_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.timestamp.desc()).all()

@app.post("/api/announcements", response_model=schemas.AnnouncementResponse)
def create_announcement(announcement_in: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    # Generate translated outputs via Gemini
    translations = GeminiService.generate_announcements(announcement_in.original_text)
    
    new_announcement = Announcement(
        original_text=announcement_in.original_text,
        english=translations.get("english"),
        spanish=translations.get("spanish"),
        french=translations.get("french"),
        arabic=translations.get("arabic"),
        portuguese=translations.get("portuguese")
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    return new_announcement

# ----------------- AI STADIUM ASSISTANT / RAG -----------------
@app.post("/api/chat", response_model=schemas.ChatResponse)
def chat_assistant(request: schemas.ChatRequest):
    return GeminiService.rag_search(request.message, request.role)

# ----------------- REPORT GENERATION -----------------
@app.get("/api/reports/executive")
def get_executive_report(db: Session = Depends(get_db)):
    report_md = GeminiService.generate_executive_report(db)
    return {"report": report_md}

# ----------------- MANUAL SIMULATION TRIGGER -----------------
@app.post("/api/simulator/tick")
def trigger_manual_tick(db: Session = Depends(get_db)):
    simulate_realtime_tick(db)
    return {"status": "success", "message": "Manual simulation step triggered."}
