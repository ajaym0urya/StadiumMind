import os
import json
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.domain.models import Incident, Gate, TransportStatus, SustainabilityMetric, Alert

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import Google GenAI SDK
GEMINI_AVAILABLE = False
try:
    from google import genai
    from google.genai import types
    if os.getenv("GEMINI_API_KEY"):
        client = genai.Client()
        GEMINI_AVAILABLE = True
        logger.info("Google GenAI client initialized successfully.")
    else:
        logger.warning("GEMINI_API_KEY environment variable not set. Running in simulation mode.")
except Exception as e:
    logger.warning(f"Failed to load Google GenAI SDK: {e}. Running in simulation mode.")

# Mock Knowledge Base Documents
KNOWLEDGE_BASE = {
    "gates": "Gates open 3 hours prior to kickoff. Gate A (North) is closest to Parking Lot A. Gate B is linked to Metro Line 1. Gate E is ADA accessible equipped with ramps, wheelchair assistants, and elevators to Tier 2 seats.",
    "emergency": "In case of fire, evacuate via nearest signed emergency exit. Contact security control immediately at ext 911. First Aid stations are located near Gate B (Station B) and Gate F (Station F).",
    "volunteer": "Volunteers must check-in at Sector C 2 hours before Match. Uniform is blue FIFA 2026 volunteer shirt and lanyard. SOP dictates: report all security and medical issues via the app immediately, do not attempt to handle violent crowd issues directly.",
    "accessibility": "ADA tickets provide access to elevator-enabled Gates C and E. Accessible shuttles run every 5 mins from Parking Lot East. Companion seats are available in all sectors, booking required.",
    "transport": "Metro Stadium Station services Downtown Express Line 1 and North Hub Line 3. Shuttles route from Parking East (Route A) and Parking West (Route B). Walking time to downtown center is 35 minutes.",
}

class GeminiService:
    @staticmethod
    def _call_gemini_or_fallback(prompt: str, mock_data: Any) -> str:
        """Helper to invoke Gemini API if available, else return fallback mock data."""
        if GEMINI_AVAILABLE:
            try:
                # Use gemini-2.5-pro as specified in the prompt
                response = client.models.generate_content(
                    model='gemini-2.5-pro',
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as ex:
                logger.error(f"Gemini API invocation failed: {ex}. Falling back to simulation.")
        
        # Fallback to simulation mode output
        if isinstance(mock_data, str):
            return mock_data
        return json.dumps(mock_data)

    @classmethod
    def rag_search(cls, query: str, user_role: str = "fan") -> Dict[str, Any]:
        """Q&A using trusted documents to prevent hallucinations."""
        query_lower = query.lower()
        context = ""
        
        # Simple retrieval matching
        if "gate" in query_lower or "entrance" in query_lower or "restroom" in query_lower:
            context += KNOWLEDGE_BASE["gates"] + " "
        if "emergency" in query_lower or "fire" in query_lower or "medical" in query_lower or "hurt" in query_lower:
            context += KNOWLEDGE_BASE["emergency"] + " "
        if "volunteer" in query_lower or "duty" in query_lower or "sop" in query_lower:
            context += KNOWLEDGE_BASE["volunteer"] + " "
        if "accessible" in query_lower or "wheelchair" in query_lower or "stairs" in query_lower or "ada" in query_lower:
            context += KNOWLEDGE_BASE["accessibility"] + " "
        if "metro" in query_lower or "bus" in query_lower or "transit" in query_lower or "park" in query_lower:
            context += KNOWLEDGE_BASE["transport"] + " "

        if not context:
            context = "General stadium operations, gates, accessibility, and emergency support."

        prompt = f"""
        You are the StadiumMind AI Assistant for the FIFA World Cup 2026.
        Answer the following user question based ONLY on the provided context below.
        If the answer cannot be found in the context, politely respond that you do not have that specific information in your trusted operational guidelines.
        Do NOT make up facts or hallucinate.
        
        User Role: {user_role}
        Context: {context}
        Question: {query}
        
        Answer (concise, clear, and action-oriented):
        """

        fallback_response = f"Based on our FIFA World Cup 2026 operations manuals: "
        if "gate" in query_lower:
            fallback_response += "Gate B (Metro) is open but currently crowded. For accessibility and wheelchair-friendly routing, we highly recommend utilizing Gate E, which is fully ramped and has dedicated customer guides."
        elif "emergency" in query_lower or "hurt" in query_lower:
            fallback_response += "Please alert nearest venue staff. First Aid Station B is located near the Metro Entrance, and Station F is located near the West Plaza."
        elif "transit" in query_lower or "metro" in query_lower:
            fallback_response += "Metro Line 1 is experiencing minor delays of 12 minutes. We suggest taking Shuttle Route B (West Lots) or Line 3 which are running normally."
        else:
            fallback_response += "Please consult your stadium map or visit the nearest Help Desk. If you need special assistance, Gate E is fully equipped for ADA accessibility."

        ans = cls._call_gemini_or_fallback(prompt, fallback_response)
        return {"response": ans, "source": "Vertex RAG Engine" if GEMINI_AVAILABLE else "Simulation RAG Engine"}

    @classmethod
    def summarize_incident(cls, description: str) -> Dict[str, Any]:
        """Summarizes and prioritizes an incoming incident description."""
        prompt = f"""
        Analyze the following incident reported by a stadium volunteer.
        Extract and return a JSON object with the following fields:
        - "summary": A concise 1-sentence summary of the incident.
        - "severity": One of "low", "medium", "high", "critical".
        - "category": One of "security", "medical", "facilities", "crowd", "general".
        - "assigned_dept": One of "security_force", "medical_team", "cleaning_crew", "crowd_control", "maintenance".
        - "suggested_response": Practical steps the operations team should execute.
        - "nearby_resources": Recommended local resources to check.
        
        Incident Description: "{description}"
        JSON Output:
        """

        # Set default values for mock fallback
        desc_lower = description.lower()
        if "crying" in desc_lower or "lost" in desc_lower or "child" in desc_lower:
            fallback = {
                "summary": "Lost child reported crying near Gate 5.",
                "severity": "medium",
                "category": "security",
                "assigned_dept": "security_force",
                "suggested_response": "Deploy volunteer supervisors to Gate 5 info desk; broadcast descriptive alert to guard patrol; contact stadium lost child center.",
                "nearby_resources": "Gate 5 Security Station (40m away)"
            }
        elif "fight" in desc_lower or "alcohol" in desc_lower or "security" in desc_lower:
            fallback = {
                "summary": "Altercation reported near seating row.",
                "severity": "high",
                "category": "security",
                "assigned_dept": "security_force",
                "suggested_response": "Dispatch nearest security unit to Row 14, Section 102; monitor CCTV feeds; alert local law enforcement if escalates.",
                "nearby_resources": "Section 104 Patrol Unit (30m away)"
            }
        elif "chest" in desc_lower or "breath" in desc_lower or "collapse" in desc_lower or "hurt" in desc_lower:
            fallback = {
                "summary": "Spectator medical emergency.",
                "severity": "critical",
                "category": "medical",
                "assigned_dept": "medical_team",
                "suggested_response": "Dispatch emergency medical team with defibrillator immediately; clear seating aisle; guide paramedics.",
                "nearby_resources": "First Aid Post B (70m away)"
            }
        else:
            fallback = {
                "summary": "Facilities maintenance incident reported.",
                "severity": "low",
                "category": "facilities",
                "assigned_dept": "cleaning_crew",
                "suggested_response": "Dispatch cleaning staff to wipe floor and set up caution wet floor signs.",
                "nearby_resources": "Cleaning Closet Sector D (100m away)"
            }

        response_text = cls._call_gemini_or_fallback(prompt, fallback)
        try:
            return json.loads(response_text)
        except Exception:
            return fallback

    @classmethod
    def generate_announcements(cls, input_text: str) -> Dict[str, str]:
        """Translates public announcements into English, Spanish, French, Arabic, and Portuguese."""
        prompt = f"""
        Translate the following stadium operational announcement into five languages:
        1. English
        2. Spanish (Español)
        3. French (Français)
        4. Arabic (العربية)
        5. Portuguese (Português)
        
        Maintain a polite, clear, and professional tone.
        Return your response in a strict JSON format with keys: "english", "spanish", "french", "arabic", "portuguese".
        
        Announcement Text: "{input_text}"
        JSON Output:
        """

        # Custom mock fallback translations
        fallback = {
            "english": f"Attention spectators: {input_text}. Please follow safety signs.",
            "spanish": f"Atención espectadores: {input_text}. Por favor, siga las señales de seguridad.",
            "french": f"Attention spectateurs: {input_text}. Veuillez suivre les consignes de sécurité.",
            "arabic": f"تنبيه للجماهير: {input_text}. يرجى اتباع إرشادات السلامة.",
            "portuguese": f"Atenção espectadores: {input_text}. Por favor, siga as sinalizações de segurança."
        }

        response_text = cls._call_gemini_or_fallback(prompt, fallback)
        try:
            return json.loads(response_text)
        except Exception:
            return fallback

    @classmethod
    def generate_executive_report(cls, db: Session) -> str:
        """Generates a beautiful daily summary report for the World Cup Venue Directors."""
        # Query stats from DB
        incidents_count = db.query(Incident).count()
        open_incidents = db.query(Incident).filter(Incident.status == "open").count()
        gates_critical = db.query(Gate).filter(Gate.status == "critical").count()
        active_alerts = db.query(Alert).filter(Alert.is_active == True).count()
        avg_queue_time = sum([g.queue_time_mins for g in db.query(Gate).all()]) / 6.0
        
        prompt = f"""
        Generate a professional executive report for the FIFA World Cup Stadium Operations Center.
        Include details of:
        - Operational overview (Queue time: {avg_queue_time:.1f} mins, critical gates: {gates_critical})
        - Incident status (Total reported: {incidents_count}, Open: {open_incidents})
        - Active alerts status: {active_alerts} active alerts.
        - Key recommendations for upcoming match-day shifts.
        
        Make the markdown structure professional, clean, and dashboard-ready.
        """

        fallback = f"""### FIFA World Cup 2026 – Daily Venue Operations Report
**Venue:** StadiumMind Arena | **Reporting Period:** Matchday Live Shift

#### 1. Executive Summary
Operations are generally stable with minor transport and gate bottlenecks. Total venue attendance is **82,400** (Full Capacity). Average entrance wait time is **{avg_queue_time:.1f} minutes**.

#### 2. Key Operational Metrics
- **Crowd flow:** Gate B (Metro) peaked at **490 entering fans/min**, causing a temporary queue surge. Other gates (A, C, D, E, F) remain under nominal workloads.
- **Incidents:** **{incidents_count}** incidents logged today. **{open_incidents}** remaining open. One major heat/cardiac incident near Sec 204 successfully treated.
- **Sustainability:** Water flow and energy consumption are within SAIF bounds. Recycling capture rate is currently at **62%**.

#### 3. AI Copilot Recommendations
- **Spectator Routing:** Retain volunteer redirection guidance at Metro exits. Redirect 25% of fans to Gate A to mitigate Gate B congestion.
- **Logistics:** Deploy two additional cleaning crews to the North Food concession row to prevent slip-and-fall hazards.
"""
        return cls._call_gemini_or_fallback(prompt, fallback)

    @classmethod
    def generate_sustainability_recommendations(cls, db: Session) -> str:
        """Generates sustainability and waste optimization suggestions."""
        metrics = db.query(SustainabilityMetric).all()
        overfilled_bins = [m.bin_id for m in metrics if m.fill_level > 80.0]
        
        prompt = f"""
        Based on the current waste bins level (overfilled: {overfilled_bins}), water and energy grid telemetry,
        recommend sustainability actions to optimize cleaning crews and save utility costs.
        Format as clear, bulleted markdown text.
        """
        
        bins_text = ", ".join(overfilled_bins) if overfilled_bins else "None"
        fallback = f"""- **Waste Collection Priority:** Bins [{bins_text}] have exceeded 80% fill capacity. Dispatch cleaning teams immediately to clear these hubs.
- **Power Optimization:** Turn off secondary hallway lighting and reduce LED brightness in non-essential areas by 15% as daylight lasts, saving approx 120 kWh.
- **Water Management:** Water flow meters in VIP sector indicate slight high usage; check for potential faucet leaks in restrooms C1 and C2.
"""
        return cls._call_gemini_or_fallback(prompt, fallback)
