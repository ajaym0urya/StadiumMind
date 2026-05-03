# ElecTech — Full Project Guide & Configuration

Welcome to **ElecTech**, an AI-powered Election Process Education Assistant. This guide will help you configure and navigate the full application.

## 🏗️ Project Architecture

-   **Frontend**: React (Vite) + Tailwind CSS + Framer Motion.
-   **Backend**: FastAPI (Python) + Uvicorn.
-   **Database**: Firebase Firestore.
-   **Authentication**: Firebase Auth (Google Sign-In).
-   **AI Intelligence**: Google Gemini 2.0 Flash.

---

## ⚙️ Configuration & Setup

### 1. Backend (FastAPI)
Navigate to the `server/` directory:
-   **Install Dependencies**: `pip install -r requirements.txt`
-   **Environment Variables**: Create a `.env` file in `server/` with:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
    ```
-   **Firebase Service Account**: 
    1. Go to Firebase Console > Project Settings > Service Accounts.
    2. Click **Generate new private key**.
    3. Save the JSON file as `firebase-service-account.json` in the `server/` directory.

### 2. Frontend (React)
Navigate to the `client/` directory:
-   **Install Dependencies**: `npm install`
-   **Environment Variables**: Create a `.env` file in `client/` with:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_API_BASE_URL=http://localhost:8000
    ```

---

## 🚀 How to Run

1.  **Start Backend**:
    ```bash
    cd server
    python main.py
    ```
    The API will run on `http://localhost:8000`.

2.  **Start Frontend**:
    ```bash
    cd client
    npm run dev
    ```
    The web app will run on `http://localhost:5173`.

---

## 🗺️ App Navigation Guide

### 1. Landing Page (`/`)
-   Premium, high-conversion entry point.
-   Explains core features: Interactive Learning, AI Companion, and Timelines.
-   Action: Click **"Start Learning"** to proceed to authentication.

### 2. Authentication Page (`/auth`)
-   Secure login using Firebase Google Auth.
-   Handles both new registration and existing user login.

### 3. Dashboard / Overview (`/dashboard`)
-   Your civic learning hub.
-   Displays current learning progress and recommended next steps.
-   Quick access to the AI Assistant and Quiz modules.

### 4. Interactive Timeline (`/timeline`)
-   A visual, animated stepper showing the 7 stages of an election.
-   Click each stage to see detailed AI-generated educational content.

### 5. AI Assistant (`/assistant`)
-   A dedicated chat interface to ask any question about the election process.
-   Powered by Gemini 2.0 Flash for accurate, simplified explanations.

### 6. Quiz Module (`/quiz`)
-   AI-generated questions based on election knowledge.
-   Instant feedback and score tracking to gamify the learning experience.

---

## 🛠️ Key Files to Customize
-   `server/services/ai_service.py`: Modify the system prompts to change AI behavior.
-   `client/src/index.css`: Update the CSS variables to change the theme colors.
-   `client/src/pages/`: Add new pages or modify existing layouts.

---

## ⚠️ Important Notes
-   **Mistral AI Removal**: All logic previously using Mistral has been migrated to Gemini 2.0 Flash in Python.
-   **Database**: All data persistence is now handled by Firebase Firestore. Ensure your Firestore rules allow read/write for authenticated users.
