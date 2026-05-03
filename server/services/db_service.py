import os
from firebase_admin import firestore

class DBService:
    def __init__(self):
        try:
            self.db = firestore.client()
        except:
            self.db = None

    async def save_user_profile(self, user_id, profile_data):
        if not self.db: return
        self.db.collection('users').document(user_id).set(profile_data, merge=True)

    async def get_user_profile(self, user_id):
        if not self.db: return None
        doc = self.db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None

    async def log_interaction(self, user_id, interaction_type, data):
        if not self.db: return
        self.db.collection('interactions').add({
            'userId': user_id,
            'type': interaction_type,
            'data': data,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

    async def save_quiz_result(self, user_id, result):
        if not self.db: return
        self.db.collection('quiz_results').add({
            'userId': user_id,
            'score': result.get('score'),
            'total': result.get('total'),
            'timestamp': firestore.SERVER_TIMESTAMP
        })
