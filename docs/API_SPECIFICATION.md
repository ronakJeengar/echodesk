# API & WebSocket Specification
## EchoDesk — AI Voice Agent & Field Operations CRM

**Base URL:** `https://api.echodesk.io/api/v1` (Production) / `http://localhost:5000/api/v1` (Development)  
**Authentication:** Bearer JWT in `Authorization` header OR HttpOnly Cookie (`accessToken`).

---

## 1. Authentication Endpoints

### 1.1 User Registration
* **Endpoint:** `POST /auth/register`
* **Request Body:**
  ```json
  {
    "fullName": "Dave Miller",
    "email": "dave@prohvac.com",
    "password": "SecurePassword123!",
    "workspaceName": "Pro HVAC Solutions",
    "industry": "HVAC"
  }
  ```
* **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "User registered and workspace created",
    "data": {
      "user": { "id": "u-101", "email": "dave@prohvac.com", "fullName": "Dave Miller" },
      "workspace": { "id": "w-501", "name": "Pro HVAC Solutions", "role": "OWNER" },
      "accessToken": "eyJhbGci..."
    }
  }
  ```

### 1.2 User Login
* **Endpoint:** `POST /auth/login`
* **Request Body:**
  ```json
  {
    "email": "dave@prohvac.com",
    "password": "SecurePassword123!"
  }
  ```

---

## 2. Voice Ingestion & Audio Pipeline

### 2.1 Request Pre-Signed Audio Upload URL
Generates a short-lived S3/R2 direct upload URL so the mobile client doesn't choke the Node.js API with binary streaming.

* **Endpoint:** `POST /recordings/presigned-url`
* **Request Body:**
  ```json
  {
    "workspaceId": "w-501",
    "fileSizeBytes": 1048576,
    "audioFormat": "m4a",
    "durationSec": 48.5
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "recordingId": "rec-8092",
      "uploadUrl": "https://storage.echodesk.io/audio/w-501/rec-8092.m4a?X-Amz-Signature=...",
      "audioKey": "audio/w-501/rec-8092.m4a"
    }
  }
  ```

### 2.2 Trigger Asynchronous AI Processing
Called immediately after the client completes uploading the raw audio to S3.

* **Endpoint:** `POST /recordings/:recordingId/process`
* **Request Body (Optional overrides):**
  ```json
  {
    "customerId": "cust-201",
    "jobCategory": "HVAC"
  }
  ```
* **Response (`202 Accepted`):**
  ```json
  {
    "success": true,
    "message": "Recording queued for STT and LLM entity extraction",
    "data": {
      "recordingId": "rec-8092",
      "status": "TRANSCRIBING",
      "estimatedDurationSec": 2.5
    }
  }
  ```

### 2.3 Get Recording Details & Extracted Entities
* **Endpoint:** `GET /recordings/:recordingId`
* **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "rec-8092",
      "status": "COMPLETED",
      "audioUrl": "https://signed.echodesk.io/rec-8092.m4a",
      "audioDurationSec": 48.5,
      "rawTranscript": "Just wrapped up at Sarah Jenkins' office at Apex Logistics...",
      "wordTimestamps": [
        { "word": "Just", "start": 0.12, "end": 0.35, "confidence": 0.99 },
        { "word": "wrapped", "start": 0.36, "end": 0.65, "confidence": 0.98 }
      ],
      "extractedData": {
        "summary": "Replaced faulty capacitor on outdoor AC unit.",
        "customer": { "name": "Sarah Jenkins", "company": "Apex Logistics" },
        "partsUsed": [{ "name": "Run Capacitor 45/5", "quantity": 1, "unitCost": 42.0 }],
        "financials": { "quotedAmount": 285.00 },
        "actionItems": [
          { "title": "Send invoice #4092", "dueDate": "2026-08-25T17:00:00Z", "priority": "HIGH" }
        ],
        "sentiment": "POSITIVE"
      }
    }
  }
  ```

### 2.4 One-Click AI Correction / Re-prompt
* **Endpoint:** `POST /recordings/:recordingId/re-extract`
* **Request Body:**
  ```json
  {
    "promptAdjustment": "The quoted amount was $320, not $285 because of emergency weekend labor."
  }
  ```

---

## 3. CRM Customers & Jobs Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/customers` | List all workspace customers with search & pagination |
| `POST` | `/customers` | Create new customer profile |
| `GET` | `/customers/:id/timeline` | Get unified chronological timeline (Voice notes, Jobs, Invoices) |
| `GET` | `/jobs` | List field jobs with filters (`status`, `dateRange`, `techId`) |
| `PATCH`| `/jobs/:id` | Update job status, labor hours, or notes |
| `GET` | `/tasks` | List actionable follow-up items |
| `PATCH`| `/tasks/:id` | Toggle task completion / change priority |

---

## 4. WebSocket Real-Time Event Protocol (Socket.IO)

All real-time events are partitioned into workspace and recording rooms.

### 4.1 Client Emitted Events
* `join:workspace` `(workspaceId)`: Subscribes client to company-wide job feeds.
* `join:recording` `(recordingId)`: Subscribes client to a specific recording's live progress.

### 4.2 Server Broadcasted Events
* `recording:status_change`:
  ```json
  {
    "recordingId": "rec-8092",
    "status": "EXTRACTING",
    "progressPercent": 65
  }
  ```
* `recording:completed`:
  ```json
  {
    "recordingId": "rec-8092",
    "status": "COMPLETED",
    "extractedData": { ... }
  }
  ```
* `customer:activity`:
  ```json
  {
    "customerId": "cust-201",
    "action": "VOICE_NOTE_ADDED",
    "summary": "AC diagnostic recorded by Dave Miller"
  }
  ```
