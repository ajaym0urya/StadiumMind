SYSTEM_PROMPT = """You are ElecTech, a friendly and helpful election assistant for Indian voters.

STRICT RULES:
1. Always be neutral - NEVER mention any political party, candidate, or political ideology.
2. Base all information on the Election Commission of India (ECI) official processes.
3. Give step-by-step, actionable guidance that a beginner can follow.
4. Use simple language. You can use Hinglish (mix of Hindi and English) when appropriate.
5. Always end with "What should you do next?" followed by a clear next action.
6. Be encouraging and supportive about civic participation.
7. Focus on WHAT the user should DO, not just information.
8. Keep responses concise but complete.
9. When generating JSON, include a "reasoning" field explaining WHY this recommendation is personalized.
10. Include a "confidenceScore" (0-100) indicating how confident you are in the recommendation."""

PROMPTS = {
    "journey": lambda user: {
        "system": SYSTEM_PROMPT,
        "prompt": f"""Generate a personalized voting journey for this Indian voter:
- Name: {user.get('name')}
- Age: {user.get('age')}
- State: {user.get('state')}
- Voter Registration Status: {user.get('voterStatus')}
- Has Voter ID: {user.get('hasVoterId')}
- First Time Voter: {user.get('isFirstTimeVoter')}
- Pincode: {user.get('pincode', 'Not provided')}

Create a step-by-step journey with exactly 5-7 steps. For each step include:
1. Step number and title
2. What to do (2-3 clear sentences)
3. Important link or resource (use official ECI links)
4. Estimated time to complete

Format your response as JSON:
{{
  "steps": [
    {{
      "number": 1,
      "title": "Step Title",
      "description": "What to do",
      "resource": "https://...",
      "estimatedTime": "10 minutes",
      "completed": false
    }}
  ],
  "summary": "One line summary of the journey",
  "nextAction": "What the user should do right now",
  "reasoning": "Why this journey was personalized this way for the user",
  "confidenceScore": 85
}}"""
    },

    "chat": lambda message, user, history=[]: {
        "system": f"""{SYSTEM_PROMPT}

VOTER CONTEXT:
- Name: {user.get('name')} | Age: {user.get('age')} | State: {user.get('state')}
- Registration: {user.get('voterStatus')} | Has Voter ID: {user.get('hasVoterId')}
- First-Time Voter: {user.get('isFirstTimeVoter', False)}

CONVERSATION SO FAR:
{chr(10).join([f"{'VOTER' if m['role'] == 'user' else 'AI'}: {m['content']}" for m in history[-8:]])}

CRITICAL: Answer election-related questions directly. Be concise, use bullet points, and ## headings. End with "👉 Next Step:".""",
        "prompt": message
    },

    "quiz": lambda topic="Election Process": {
        "system": SYSTEM_PROMPT,
        "prompt": f"""Generate 5 multiple-choice questions about {topic}.
Format as JSON array:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "..."
  }}
]"""
    },

    "scenario": lambda scenario_type, user: {
        "system": SYSTEM_PROMPT,
        "prompt": f"""Simulate this voter scenario: {scenario_type}
Voter: {user.get('name')}, Age {user.get('age')}, from {user.get('state')}
Provide a step-by-step solution.
Format as JSON:
{{
  "title": "...",
  "description": "...",
  "steps": [{{ "number": 1, "action": "...", "details": "...", "link": "..." }}],
  "documentsNeeded": ["..."],
  "estimatedTime": "...",
  "helplineNumber": "1950",
  "nextAction": "..."
}}"""
    },

    "timeline": lambda user: {
        "system": SYSTEM_PROMPT,
        "prompt": f"""Generate a voting timeline for {user.get('name')} in {user.get('state')}.
Format as JSON:
{{
  "events": [{{ "id": 1, "title": "...", "description": "...", "deadline": "...", "daysFromNow": 10, "priority": "high", "completed": false }}],
  "nextAction": "..."
}}"""
    },

    "booth": lambda pincode, area, user: {
        "system": SYSTEM_PROMPT,
        "prompt": f"""Provide polling booth guidance for an Indian voter:
Area/Pincode: {pincode or area or 'Not specified'}
State: {user.get('state')}
Voter Status: {user.get('voterStatus')}
Format as JSON:
{{
  "howToFind": {{ "steps": ["..."], "officialLink": "..." }},
  "boothProcess": [{{ "step": 1, "description": "..." }}],
  "whatToCarry": ["..."],
  "dos": ["..."],
  "donts": ["..."],
  "timing": "...",
  "nextAction": "..."
}}"""
    }
}
