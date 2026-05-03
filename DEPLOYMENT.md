# 🚀 Deployment Guide: ElecTech on Google Cloud Run

This guide covers the end-to-end process of deploying the ElecTech platform (React + FastAPI) as a single monolithic container to Google Cloud Run.

---

## 📋 Prerequisites

1.  **Google Cloud Project**: Created and active.
2.  **Google Cloud SDK (gcloud)**: [Installed and authenticated](https://cloud.google.com/sdk/docs/install).
3.  **Docker**: Installed and running locally.
4.  **Enabled APIs**:
    ```bash
    gcloud services enable run.googleapis.com \
                           containerregistry.googleapis.com \
                           cloudbuild.googleapis.com \
                           artifactregistry.googleapis.com
    ```

---

## 🛠️ Step 1: Prepare Your Environment

Ensure your `.env` secrets are ready. For Cloud Run, you should NOT include `.env` files in your container. Instead, you will inject them during deployment.

### Sensitive Files
The `server/firebase-service-account.json` is required. You have two options:
1.  **Direct File**: Keep it in the `server/` folder (it's ignored by Git but will be copied by Docker if specified).
2.  **Secret Manager (Recommended)**: Store the JSON content in Google Secret Manager and mount it.

---

## 🏗️ Step 2: Local Container Validation

Before pushing to the cloud, verify the build works locally:

```bash
# Build the image
docker build -t electech-app .

# Run locally to test
docker run -p 8080:8080 \
  -e GEMINI_API_KEY="your_key" \
  -e FIREBASE_PROJECT_ID="your_project" \
  electech-app
```
*Access it at `http://localhost:8080`*

---

## ☁️ Step 3: Deploy to Google Cloud

### 1. Create an Artifact Registry Repository
```bash
gcloud artifacts repositories create electech-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="ElecTech Docker Repository"
```

### 2. Build and Push using Cloud Build
This is the fastest way as it builds the image on Google's infrastructure:

```bash
# Replace PROJECT_ID with your actual Google Cloud Project ID
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/electech-repo/electech-app:latest .
```

### 3. Deploy to Cloud Run
Run the following command to deploy:

```bash
gcloud run deploy electech-service \
  --image us-central1-docker.pkg.dev/PROJECT_ID/electech-repo/electech-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your_key_here,FIREBASE_PROJECT_ID=your_id_here"
```

---

## 🛡️ Step 4: Best Practices for Success

### 1. Handling Firebase Credentials in Cloud Run
Instead of hardcoding the `firebase-service-account.json`, you can pass the content as a string, or use Google's Secret Manager.

### 2. Startup CPU Boost
Enable "Startup CPU Boost" in the Cloud Run console. This significantly reduces the time it takes for your React app to become available after a "cold start."

### 3. Continuous Deployment
Connect your GitHub repository to Cloud Run using the **"Set up Cloud Build"** button in the Cloud Run console. This will automatically redeploy every time you push to `main`.

---

## 🔍 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **404 on Page Refresh** | Ensure `main.py` has the 404 handler that serves `index.html` (already implemented). |
| **AI Timeout** | Increase the Cloud Run timeout to 60 or 120 seconds in the console if Gemini takes long to respond. |
| **CORS Errors** | Since we are using a monolithic build, CORS is not an issue. |
| **Memory Issues** | If the build fails, increase memory to 1GiB or 2GiB in Cloud Run settings. |
