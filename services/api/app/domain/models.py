from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="fan")  # fan, organizer, volunteer, security, staff

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    home_team = Column(String, nullable=False)
    away_team = Column(String, nullable=False)
    kickoff_time = Column(DateTime, nullable=False)
    status = Column(String, default="upcoming")  # upcoming, live, finished
    attendance = Column(Integer, default=0)
    score = Column(String, default="0-0")

class Gate(Base):
    __tablename__ = "gates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    capacity = Column(Integer, default=10000)
    current_flow = Column(Integer, default=0)  # scans per minute
    status = Column(String, default="nominal")  # nominal, crowded, critical
    queue_time_mins = Column(Integer, default=0)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    severity = Column(String, default="low")  # low, medium, high, critical
    status = Column(String, default="open")  # open, responding, resolved
    category = Column(String, default="general")  # security, medical, facilities, crowd, general
    reporter_role = Column(String, default="volunteer")
    ai_summary = Column(Text, nullable=True)
    assigned_dept = Column(String, nullable=True)
    nearby_resources = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class TransportStatus(Base):
    __tablename__ = "transport_status"
    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String, nullable=False)  # metro, bus, parking, walking
    destination = Column(String, nullable=False)
    status = Column(String, default="normal")  # normal, delayed, suspended
    delay_mins = Column(Integer, default=0)
    congestion_level = Column(String, default="low")  # low, medium, high, critical
    update_time = Column(DateTime, default=datetime.utcnow)

class SustainabilityMetric(Base):
    __tablename__ = "sustainability_metrics"
    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(String, nullable=False)
    bin_type = Column(String, nullable=False)  # landfill, recycle, compost
    fill_level = Column(Float, default=0.0)  # percentage 0 to 100
    water_usage = Column(Float, default=0.0)  # liters per min
    power_usage = Column(Float, default=0.0)  # kWh
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, warning, critical, copilot
    is_active = Column(Boolean, default=True)
    recommended_action = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    english = Column(Text, nullable=True)
    spanish = Column(Text, nullable=True)
    french = Column(Text, nullable=True)
    arabic = Column(Text, nullable=True)
    portuguese = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
