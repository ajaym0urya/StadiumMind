import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.domain.models import User, Match, Gate, Incident, TransportStatus, SustainabilityMetric, Alert
from app.core.database import SessionLocal

def seed_initial_data(db: Session):
    # Check if database is already seeded
    if db.query(Gate).first() is not None:
        return

    print("Seeding initial stadium data...")

    # 1. Seed users
    admin_user = User(email="admin@stadiummind.com", password_hash="pbkdf2:sha256:600000$mockhash$adminpass", role="organizer")
    fan_user = User(email="fan@stadiummind.com", password_hash="pbkdf2:sha256:600000$mockhash$fanpass", role="fan")
    volunteer_user = User(email="volunteer@stadiummind.com", password_hash="pbkdf2:sha256:600000$mockhash$volunteerpass", role="volunteer")
    security_user = User(email="security@stadiummind.com", password_hash="pbkdf2:sha256:600000$mockhash$securitypass", role="security")
    staff_user = User(email="staff@stadiummind.com", password_hash="pbkdf2:sha256:600000$mockhash$staffpass", role="staff")
    db.add_all([admin_user, fan_user, volunteer_user, security_user, staff_user])

    # 2. Seed Matches
    match1 = Match(
        home_team="USA",
        away_team="Mexico",
        kickoff_time=datetime.utcnow() + timedelta(hours=2),
        status="live",
        attendance=82400,
        score="2 - 1"
    )
    match2 = Match(
        home_team="Canada",
        away_team="England",
        kickoff_time=datetime.utcnow() + timedelta(days=1),
        status="upcoming",
        attendance=0,
        score="0-0"
    )
    db.add_all([match1, match2])

    # 3. Seed Gates
    gates = [
        Gate(name="Gate A - North Plaza", capacity=15000, current_flow=110, status="nominal", queue_time_mins=4),
        Gate(name="Gate B - Metro Connector", capacity=25000, current_flow=490, status="crowded", queue_time_mins=24),
        Gate(name="Gate C - VIP Suite Entrance", capacity=5000, current_flow=25, status="nominal", queue_time_mins=2),
        Gate(name="Gate D - Parking Express shuttle", capacity=18000, current_flow=180, status="nominal", queue_time_mins=8),
        Gate(name="Gate E - ADA Accessibility", capacity=8000, current_flow=40, status="nominal", queue_time_mins=3),
        Gate(name="Gate F - West Boulevard", capacity=12000, current_flow=95, status="nominal", queue_time_mins=3)
    ]
    db.add_all(gates)

    # 4. Seed Transport
    transport = [
        TransportStatus(mode="metro", destination="Downtown Express Line 1", status="delayed", delay_mins=12, congestion_level="critical"),
        TransportStatus(mode="metro", destination="North Hub Line 3", status="normal", delay_mins=0, congestion_level="medium"),
        TransportStatus(mode="bus", destination="Shuttle Route A (East Lots)", status="normal", delay_mins=3, congestion_level="low"),
        TransportStatus(mode="bus", destination="Shuttle Route B (West Lots)", status="normal", delay_mins=1, congestion_level="medium"),
        TransportStatus(mode="parking", destination="Parking Lot West (General)", status="full", delay_mins=0, congestion_level="critical"),
        TransportStatus(mode="parking", destination="Parking Lot East (Reserved)", status="normal", delay_mins=0, congestion_level="medium"),
        TransportStatus(mode="walking", destination="Main Fan Walk", status="normal", delay_mins=0, congestion_level="high")
    ]
    db.add_all(transport)

    # 5. Seed Bins
    bins = []
    for i in range(1, 7):
        bins.append(SustainabilityMetric(bin_id=f"BIN-G{i}-R", bin_type="recycle", fill_level=45.2 + i*5, water_usage=0.0, power_usage=1.2 * i))
        bins.append(SustainabilityMetric(bin_id=f"BIN-G{i}-L", bin_type="landfill", fill_level=30.1 + i*8, water_usage=0.0, power_usage=0.8 * i))
        bins.append(SustainabilityMetric(bin_id=f"BIN-G{i}-C", bin_type="compost", fill_level=15.5 + i*4, water_usage=0.0, power_usage=0.5 * i))
    db.add_all(bins)

    # 6. Seed initial alerts
    initial_alerts = [
        Alert(message="Metro Line 1 experiencing minor signaling delays.", type="warning", is_active=True, recommended_action="Advise fans to utilize North Hub Line 3 or bus shuttles."),
        Alert(message="Gate B is heavily congested due to high flow from arrival of Metro train 405.", type="warning", is_active=True, recommended_action="Reroute 20% incoming spectators to Gate A; Deploy two extra safety guides.")
    ]
    db.add_all(initial_alerts)

    # 7. Seed initial incidents
    incidents = [
        Incident(
            description="Spilled soda causing slipping hazard near Concession Stand 12.",
            severity="low",
            status="open",
            category="facilities",
            reporter_role="volunteer",
            ai_summary="Slipping hazard from spilled liquid near food stalls.",
            assigned_dept="cleaning",
            nearby_resources="Cleaning Cart 3 (50m away)"
        ),
        Incident(
            description="A fan collapsed near Section 204. Unconscious but breathing.",
            severity="high",
            status="responding",
            category="medical",
            reporter_role="security",
            ai_summary="Medical emergency: Unconscious spectator near Section 204.",
            assigned_dept="medical",
            nearby_resources="First Aid Station B (120m away), Medic Team 2 dispatched"
        )
    ]
    db.add_all(incidents)

    db.commit()
    print("Database seeded successfully.")

def simulate_realtime_tick(db: Session):
    """
    Simulates a slight fluctuation in stadium telemetry.
    Randomly changes crowd flow, queue times, and bin levels,
    and returns notifications or alerts if anomalies are triggered.
    """
    # 1. Update Gates Flow & Queue Times
    gates = db.query(Gate).all()
    for gate in gates:
        # Volatility fluctuation
        change = random.randint(-15, 15)
        gate.current_flow = max(0, gate.current_flow + change)
        
        # Calculate queue time: proportional to flow, status checks
        gate.queue_time_mins = max(1, int(gate.current_flow / 20))
        if gate.current_flow > 400:
            gate.status = "critical"
        elif gate.current_flow > 250:
            gate.status = "crowded"
        else:
            gate.status = "nominal"

    # 2. Update Sustainability Fill Levels and Usage
    metrics = db.query(SustainabilityMetric).all()
    for metric in metrics:
        # Increase waste fill level slightly
        metric.fill_level = min(100.0, metric.fill_level + random.uniform(0.1, 1.2))
        
        # Water/power fluctuating
        metric.water_usage = max(1.0, 15.0 + random.uniform(-3, 3))
        metric.power_usage = max(0.5, 4.5 + random.uniform(-0.5, 0.5))

    # 3. Random transport updates
    transports = db.query(TransportStatus).all()
    for trans in transports:
        if trans.mode == "parking" and "West" in trans.destination:
            continue # Always full
        if random.random() < 0.2:
            trans.delay_mins = max(0, trans.delay_mins + random.choice([-2, -1, 0, 1, 2]))
            if trans.delay_mins > 15:
                trans.status = "delayed"
                trans.congestion_level = "critical"
            elif trans.delay_mins > 5:
                trans.status = "delayed"
                trans.congestion_level = "high"
            else:
                trans.status = "normal"
                trans.congestion_level = "medium"

    # 4. Maybe trigger an AI Operations Copilot alert based on condition
    # E.g. if Gate B stays above 450 flow and Metro is delayed
    gate_b = db.query(Gate).filter(Gate.name.like("%Gate B%")).first()
    metro = db.query(TransportStatus).filter(TransportStatus.mode == "metro").first()
    
    if gate_b and gate_b.current_flow > 450:
        copilot_alert_exists = db.query(Alert).filter(Alert.type == "copilot", Alert.is_active == True).first()
        if not copilot_alert_exists:
            new_alert = Alert(
                message="AI Copilot Notice: Gate B queue time is projected to reach 30 minutes in 8 minutes due to arriving trains.",
                type="copilot",
                is_active=True,
                recommended_action="Reroute 25% of fans to Gate A. Dispatch 2 volunteers to Section B to direct the flow.",
                timestamp=datetime.utcnow()
            )
            db.add(new_alert)

    db.commit()
