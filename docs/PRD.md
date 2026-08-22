# Product Requirements Document (PRD)
## EchoDesk — AI Voice Agent & Field Operations CRM

**Document Version:** 1.0.0  
**Author:** EchoDesk Engineering & Product Team  
**Status:** Approved for Implementation  
**Target Release:** MVP v1.0  

---

## 1. Executive Summary
**EchoDesk** is an AI-powered voice-first Field Operations & CRM platform designed for on-the-go professionals (field technicians, sales representatives, home inspectors, contractors, and field service teams). 

Instead of spending 1–2 hours every evening typing manual notes, filling forms, and creating follow-up tasks, field workers simply press **Record** and speak naturally about their client meeting or job site inspection. EchoDesk's AI pipeline transcribes the audio in real-time, extracts structured entities (client details, work completed, parts used, costs quoted, action items, and follow-up deadlines), and automatically updates the CRM database, syncs to the Web dashboard, and schedules calendar reminders.

---

## 2. Problem Statement & User Personas

### 2.1 The Problem
- **Data Entry Burden:** Field workers lose 15–20% of their workday doing administrative data entry after jobs.
- **Lost Information:** Crucial details mentioned verbally on-site (client preferences, custom quotes, urgent repair notes) are forgotten or never logged.
- **Clunky Mobile Form Fillers:** Existing CRMs (Salesforce, HubSpot, Jobber) have mobile interfaces with 20+ fields that are frustrating to navigate on a smartphone on-site.
- **Delayed Follow-ups:** Action items and quotes take days to send because notes aren't processed until workers return to the office.

### 2.2 User Personas
1. **Dave (Field Service Technician / Electrician / HVAC)**
   - *Need:* Wants to record a 45-second voice note while walking back to his van describing what parts were replaced, what needs follow-up, and billable hours.
2. **Sarah (Commercial Real Estate & Insurance Inspector)**
   - *Need:* Records 5–10 minute room-by-room audio observations with offline capability in basements/remote sites and expects structured inspection reports generated automatically.
3. **Marcus (Field Sales Account Executive)**
   - *Need:* Records debriefs immediately after client meetings; needs CRM timeline updated, next steps assigned, and summary emails drafted.
4. **Operations Manager (Web Dashboard User)**
   - *Need:* Views real-time field activity, audits transcripts with audio playback, monitors team metrics, and exports reports.

---

## 3. Key Product Features & Scope

### 3.1 Mobile Experience (Flutter App)
- **One-Tap Voice Capture:** Minimalist, high-contrast recording screen with real-time audio waveform visualizer.
- **Live / Post-Call Transcription:** Fast Speech-to-Text (STT) with speaker and pause detection.
- **Offline-First Audio Vault:** In low/no-connectivity environments (basements, remote sites), audio is encrypted and cached locally in SQLite/local storage and automatically uploaded when connectivity resumes.
- **AI Extraction Preview Card:** Displays extracted items immediately after processing:
  - 👤 **Client / Customer Identified:** Auto-linked to existing customer or creates new lead.
  - 🛠️ **Work Summary & Key Takeaways:** Clean, bulleted executive summary.
  - 📦 **Materials / Parts / Inventory:** Quantities, part numbers, or services rendered.
  - 💰 **Financials & Estimates:** Quoted amounts, labor hours, discounts.
  - 📅 **Action Items & Follow-up Dates:** Due dates, assignees, and priority flags.
- **One-Click Corrections:** Users can tap to edit any extracted field or re-prompt the AI ("Change the follow-up date to next Friday").

### 3.2 Web Experience (React 19 Dashboard)
- **Command Center & Feed:** Real-time stream of incoming field audio notes and processed jobs.
- **Interactive Audio & Transcript Player:** Synchronized audio playback where clicking any word in the transcript jumps audio to that exact timestamp.
- **Customer CRM Timelines:** Full chronological history of every voice note, job inspection, quote, and interaction per customer.
- **Job & Task Kanban Board:** Drag-and-drop workflow tracking jobs from `Recorded` ➔ `Reviewed` ➔ `In Progress` ➔ `Invoiced` ➔ `Completed`.
- **Export & Integrations:** Generate PDF inspection summaries, export CSV data, or trigger webhooks (Zapier/Make/Slack).

### 3.3 Core AI Engine & Extraction Pipeline
- **Real-Time / Batch STT:** Support for Deepgram Nova-2 and Whisper with custom industry vocabulary boosts (HVAC terms, electrical codes, real estate jargon).
- **Structured Schema Extraction (LLM):** Multi-modal LLM reasoning (OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Flash) with strict JSON schema constraints for zero-hallucination structured parsing.
- **Confidence Scoring & Anomaly Detection:** Flags uncertain extractions (e.g., unclear dollar amounts) for manual human review.

---

## 4. Non-Functional Requirements (NFRs)

| Requirement | Target Metric |
| :--- | :--- |
| **Audio Processing Latency** | < 3.0s for a 60-second voice note (STT + LLM Extraction) |
| **Audio Storage & Security** | AES-256 encrypted at rest, S3 presigned URLs with 15-minute expiration |
| **Offline Reliability** | 100% zero audio loss during disconnects; background queue sync |
| **Uptime / Availability** | 99.9% availability for API & ingestion endpoints |
| **Mobile Battery & CPU** | Efficient audio encoding (AAC / Opus 32kbps), low background drain |
| **Data Privacy** | GDPR/SOC2 ready architecture; option to purge raw audio after transcript retention |

---

## 5. Success Metrics & KPIs
1. **Time Saved:** Reduce field admin documentation time by **> 70%** (from 60 min/day to under 15 min/day).
2. **Extraction Accuracy:** **> 95%** accuracy on action items, dates, and cost extractions without manual user edits.
3. **Daily Active Usage (DAU):** Average of **4+ voice notes recorded per technician per day**.
4. **Sync Speed:** Background offline-to-cloud sync completed in **< 10 seconds** upon network restoration.

---

## 6. MVP Release Scope vs Future Roadmap

### ✅ In-Scope for MVP (Phase 1–3)
- Multi-tenant Workspaces & Role-Based Access (Admin, Manager, Field Tech).
- Flutter mobile app for iOS and Android with one-tap recording and local offline cache.
- Node.js + Express + Prisma + PostgreSQL backend with Redis/BullMQ asynchronous processing queue.
- Speech-to-Text (STT) + LLM Structured Extraction pipeline.
- React 19 web dashboard with synchronized audio player, customer profiles, and task board.
- WebSockets for real-time live processing updates.

### 🔮 Future Considerations (v2.0+)
- Multi-speaker diarization for 2-person client meetings.
- Computer Vision integration (snap a photo of a broken machine; AI correlates photo with voice note).
- Native two-way sync with Salesforce, HubSpot, and QuickBooks.
- Custom fine-tuned industry vocabularies per enterprise workspace.
