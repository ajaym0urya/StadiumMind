import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth, firestore
import google.generativeai as genai

from services.ai_service import AIService
from services.db_service import DBService

load_dotenv()

app = FastAPI(title="ElecTech - Election Education Assistant API")
ai_service = AIService()
db_service = DBService()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
try:
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print(f"Warning: Firebase service account file not found at {cred_path}")
            firebase_admin.initialize_app()
    db = firestore.client()
except Exception as e:
    print(f"Firebase initialization error: {e}")
    db = None

@app.get("/")
async def root():
    return {"message": "Welcome to the Election Education Assistant API"}

# Auth Dependency
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@app.get("/election/steps")
async def get_steps(user=Depends(get_current_user)):
    user_data = await db_service.get_user_profile(user['uid']) or {}
    journey = await ai_service.get_personalized_journey(user_data)
    return {"success": True, "data": journey}

@app.get("/journey/{user_id}")
async def get_journey(user_id: str, user=Depends(get_current_user)):
    user_data = await db_service.get_user_profile(user_id) or {}
    journey = await ai_service.get_personalized_journey(user_data)
    return {"success": True, "data": journey}

@app.get("/checklist/{user_id}")
async def get_checklist(user_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": {"progress": {"percentage": 0, "completed": 0, "total": 5}, "items": []}}

@app.post("/chat")
async def chat(data: dict, user=Depends(get_current_user)):
    message = data.get("message")
    user_data = await db_service.get_user_profile(user['uid']) or {"name": user.get("name", "Voter")}
    response = await ai_service.get_chat_response(message, user_data)
    await db_service.log_interaction(user['uid'], "chat", {"query": message, "response": response})
    return {"success": True, "data": {"reply": response}}

@app.get("/quiz")
async def get_quiz(topic: str = "Election Process", user=Depends(get_current_user)):
    quiz = await ai_service.generate_quiz(topic)
    return {"success": True, "data": quiz}

@app.post("/auth/google")
async def auth_google(data: dict):
    id_token = data.get("idToken")
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        user_data = await db_service.get_user_profile(uid)
        if not user_data:
            user_data = {
                "uid": uid,
                "name": decoded_token.get("name", "Voter"),
                "email": decoded_token.get("email"),
                "voterStatus": "not_started",
                "isFirstTimeVoter": True,
                "profileCompleted": False,
                "state": "Unknown"
            }
            await db_service.save_user_profile(uid, user_data)
        
        return {"success": True, "data": {"user": user_data, "token": id_token}}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/auth/login")
async def auth_login(data: dict):
    return {"success": True, "data": {"user": {"name": "Test User", "profileCompleted": True}, "token": "mock-token"}}

@app.post("/auth/register")
async def auth_register(data: dict):
    return {"success": True, "data": {"user": {"name": data.get("name"), "profileCompleted": False}, "token": "mock-token"}}

@app.get("/user/me")
async def get_me(user=Depends(get_current_user)):
    user_data = await db_service.get_user_profile(user['uid'])
    if not user_data:
        user_data = {
            "uid": user['uid'],
            "name": user.get("name", "Voter"),
            "email": user.get("email"),
            "voterStatus": "not_started",
            "isFirstTimeVoter": True,
            "state": "Unknown"
        }
        await db_service.save_user_profile(user['uid'], user_data)
    
    return {"success": True, "data": {"user": user_data, "checklist": {"progress": {"percentage": 0, "completed": 0, "total": 5}, "items": []}}}

@app.get("/chat/{user_id}/history")
async def get_chat_history(user_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": []}

@app.get("/timeline/{user_id}")
async def get_timeline(user_id: str, user=Depends(get_current_user)):
    user_data = await db_service.get_user_profile(user_id) or {}
    timeline = await ai_service.get_timeline(user_data)
    return {"success": True, "data": timeline}

@app.get("/scenario/list")
async def get_scenarios(user=Depends(get_current_user)):
    # Static list of scenarios as expected by UI
    scenarios = [
        {"id": "first_time", "title": "First-Time Voter", "description": "Complete guide for new voters", "icon": "🆕"},
        {"id": "lost_id", "title": "Lost Voter ID", "description": "How to get a duplicate EPIC card", "icon": "💳"},
        {"id": "shifted", "title": "Shifted Residence", "description": "Transfer your vote to a new area", "icon": "🏠"},
        {"id": "correction", "title": "Name Correction", "description": "Fix errors in your voter details", "icon": "✏️"},
        {"id": "no_docs", "title": "No Documents", "description": "Alternative IDs allowed at booth", "icon": "📜"}
    ]
    return {"success": True, "data": scenarios}

@app.post("/scenario")
async def run_scenario(data: dict, user=Depends(get_current_user)):
    scenario_type = data.get("scenarioType")
    user_data = await db_service.get_user_profile(user['uid']) or {}
    result = await ai_service.simulate_scenario(scenario_type, user_data)
    return {"success": True, "data": result}

@app.post("/booth")
async def get_booth(data: dict, user=Depends(get_current_user)):
    pincode = data.get("pincode")
    area = data.get("area")
    user_data = await db_service.get_user_profile(user['uid']) or {}
    result = await ai_service.get_booth_guide(pincode, area, user_data)
    return {"success": True, "data": result}

@app.get("/health")
async def health_check():
    return {"success": True, "data": {"status": "healthy"}, "ai": {"ollama": False, "gemini": True, "activeProvider": "gemini"}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)