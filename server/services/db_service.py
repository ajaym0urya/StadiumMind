import os
from firebase_admin import firestore

class DBService:
    def __init__(self):
        self._db = None

    @property
    def db(self):
        if self._db is None:
            try:
                self._db = firestore.client()
            except Exception as e:
                print(f"Error getting Firestore client: {e}")
        return self._db

    async def save_user_profile(self, user_id, profile_data):
        if not self.db: return
        try:
            self.db.collection('users').document(str(user_id)).set(profile_data, merge=True)
        except Exception as e:
            print(f"Error saving user profile: {e}")

    async def get_user_profile(self, user_id):
        if not self.db: return None
        try:
            doc_ref = self.db.collection('users').document(str(user_id))
            doc = doc_ref.get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None

    async def log_interaction(self, user_id, interaction_type, data):
        if not self.db: return
        try:
            self.db.collection('interactions').add({
                'userId': str(user_id),
                'type': interaction_type,
                'data': data,
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        except Exception as e:
            print(f"Error logging interaction: {e}")

    async def save_quiz_result(self, user_id, result):
        if not self.db: return
        try:
            self.db.collection('quiz_results').add({
                'userId': str(user_id),
                'score': result.get('score'),
                'total': result.get('total'),
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        except Exception as e:
            print(f"Error saving quiz result: {e}")
