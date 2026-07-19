import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add services/api to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../services/api')))

from app.main import app

client = TestClient(app)

def test_get_matches():
    response = client.get("/api/matches")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["home_team"] == "USA"

def test_get_gates():
    response = client.get("/api/gates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(g["name"] == "Gate B - Metro Connector" for g in data)

def test_create_incident():
    payload = {
        "description": "Lost child near Gate 5 crying and looking for mother",
        "reporter_role": "volunteer",
        "category": "security"
    }
    response = client.post("/api/incidents", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "medium"
    assert "crying" in data["description"]
    assert data["ai_summary"] is not None

def test_announcements():
    payload = {
        "original_text": "Gate B is closed. Reroute to Gate A."
    }
    response = client.post("/api/announcements", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "english" in data
    assert "spanish" in data
    assert "arabic" in data

def test_chat_rag():
    payload = {
        "message": "Is Gate E elevator accessible?",
        "role": "fan"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "ADA" in data["response"] or "accessible" in data["response"] or "Gate E" in data["response"]
