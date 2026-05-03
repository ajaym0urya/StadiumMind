import os
import google.generativeai as genai
import json
from services.prompts import PROMPTS

class AIService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def _parse_json(self, text):
        try:
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            return json.loads(text)
        except:
            return None

    async def get_personalized_journey(self, user_data):
        prompt_data = PROMPTS["journey"](user_data)
        response = self.model.generate_content(
            prompt_data["prompt"],
            generation_config={"response_mime_type": "application/json"}
        )
        return self._parse_json(response.text)

    async def get_chat_response(self, message, user_data, history=[]):
        prompt_data = PROMPTS["chat"](message, user_data, history)
        # Use system instruction for better adherence
        chat_model = genai.GenerativeModel(
            'gemini-2.0-flash',
            system_instruction=prompt_data["system"]
        )
        chat = chat_model.start_chat(history=[])
        response = chat.send_message(message)
        return response.text

    async def generate_quiz(self, topic="Election Process"):
        prompt_data = PROMPTS["quiz"](topic)
        response = self.model.generate_content(
            prompt_data["prompt"],
            generation_config={"response_mime_type": "application/json"}
        )
        return self._parse_json(response.text)

    async def simulate_scenario(self, scenario_type, user_data):
        prompt_data = PROMPTS["scenario"](scenario_type, user_data)
        response = self.model.generate_content(
            prompt_data["prompt"],
            generation_config={"response_mime_type": "application/json"}
        )
        return self._parse_json(response.text)

    async def get_timeline(self, user_data):
        prompt_data = PROMPTS["timeline"](user_data)
        response = self.model.generate_content(
            prompt_data["prompt"],
            generation_config={"response_mime_type": "application/json"}
        )
        return self._parse_json(response.text)

    async def get_booth_guide(self, pincode, area, user_data):
        prompt_data = PROMPTS["booth"](pincode, area, user_data)
        response = self.model.generate_content(
            prompt_data["prompt"],
            generation_config={"response_mime_type": "application/json"}
        )
        return self._parse_json(response.text)
