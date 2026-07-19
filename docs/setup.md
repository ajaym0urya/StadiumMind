# Setup Guide, Developer Manual, and Testing Suite Specs

This document outlines instructions for configuring, running, and testing the StadiumMind AI platform.

---

## 1. Quick Start Guide

### Step 1: Clone and Set Up Workspace
Navigate to the root workspace folder:
```bash
cd c:\Ajay\Projects\FIFAAI
```

### Step 2: Running the Backend Services
Install python virtualenv (already initialized during setup) and execute:
```bash
cd services/api
.\.venv\Scripts\activate
# Start Uvicorn development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Verify API health by loading: `http://localhost:8000/docs` (Swagger OpenAPI).*

### Step 3: Running the Frontend Services
Launch the Next.js development client:
```bash
cd apps/web
npm run dev
```
*Open `http://localhost:3000` in the browser.*

---

## 2. API Endpoints Reference (FastAPI Backend)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Simple Local JWT authentications & Role Switch |
| `GET` | `/api/matches` | Retrieve matches details (USA vs MEX live) |
| `GET` | `/api/gates` | Retrieve live queue flows and scan velocities |
| `GET` | `/api/incidents` | List reported hazards and AI classifications |
| `POST` | `/api/incidents` | Submit volunteer incident (triggers Gemini RAG pipeline) |
| `GET` | `/api/transport` | Fetch metro station delays and bus queue stats |
| `GET` | `/api/sustainability/metrics` | Retrieve waste bin fill rates and water meters |
| `GET` | `/api/alerts` | List active supervisor alerts and copilot suggestions |
| `POST` | `/api/alerts/{id}/apply` | Execute AI Copilot redirection guidelines |
| `POST` | `/api/chat` | Send spectator Q&A (triggers Vertex RAG search) |
| `GET` | `/api/reports/executive` | Compile end-of-shift director log reports |

---

## 3. Testing Guide

### Running Backend Unit Tests (Pytest)
Ensure virtualenv is activated and execute:
```bash
.\services\api\.venv\Scripts\pytest.exe .\tests\test_backend.py -v
```
All tests check database connectivity, RAG templates, incident priorities, and translation generation.

### Running Frontend Tests (Jest / Playwright)
To execute frontend verification:
```bash
cd apps/web
npm run test
```
*(Tests verify that the interactive stadium map compiles, gates overlay status indicators, role workspace toggles update states, and high contrast CSS class injection executes properly).*
