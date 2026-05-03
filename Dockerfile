# --- Stage 1: Build React Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Set production URL (In Cloud Run, we use relative paths for API)
ENV VITE_API_URL=""
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY server/ ./server/

# Copy frontend build from stage 1 to backend's static folder
COPY --from=frontend-builder /app/client/dist ./server/static

# Expose port (Cloud Run uses $PORT)
ENV PORT=8080
EXPOSE 8080

# Run the application
WORKDIR /app/server
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
