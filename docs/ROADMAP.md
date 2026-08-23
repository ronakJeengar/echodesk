# Engineering Roadmap & Implementation Plan
## EchoDesk — AI Voice Agent & Field Operations CRM

---

## 🎯 Phase 1: Core Foundation & Ingestion Backend (Weeks 1–2)
- [x] **Repository Setup & Monorepo Structure:** `/backend`, `/mobile`, `/frontend`, `/docs`, `docker-compose.yml`.
- [x] **PostgreSQL & Prisma 7 Initial Schema:** User, Workspace, Membership, Customer, Recording, Job, Task, ExtractedData, ActivityLog.
- [x] **Authentication & RBAC Middleware:** JWT rotation, HttpOnly cookies, Workspace scoping, Zod validation.
- [x] **S3 / Cloudflare R2 Audio Ingestion:** Presigned upload URLs, audio metadata extraction (duration, format).
- [x] **Redis & BullMQ Setup:** Asynchronous worker queue scaffolding with retry handling and in-process fallback.

---

## 🎙️ Phase 2: AI Processing & Extraction Pipeline (Weeks 2–3)
- [x] **Speech-to-Text (STT) Integration:** Deepgram Nova-2 / OpenAI Whisper API with word-level timestamps.
- [x] **LLM Extraction Engine:** Structured JSON output via Claude 3.5 Sonnet / GPT-4o / Gemini Flash.
- [x] **Custom Industry Vocabulary System:** Dynamic vocabulary boosting per workspace industry (HVAC, Electrical, Plumbing, Inspection, General).
- [x] **Automated Entity Upsert:** Automatically linking extracted customers, creating jobs, and scheduling tasks in PostgreSQL.
- [x] **Socket.IO Event Gateway:** Live status notifications (`TRANSCRIBING` ➔ `EXTRACTING` ➔ `COMPLETED`).

---

## 📱 Phase 3: Flutter Mobile App — Voice-First Client (Weeks 4–5)
- [x] **Clean Architecture Setup:** Core, Data, Domain, Presentation layers with Riverpod.
- [x] **One-Tap Voice Recording UI:** Pulse animation, live audio visualizer, pause/resume.
- [x] **Offline Audio Vault (SQLite):** Store un-synced audio files locally when off-grid (`sqflite`); auto-upload upon reconnection.
- [x] **Extraction Preview & Quick-Edit Sheet:** Instant visual cards for extracted parts, costs, tasks, and follow-ups.
- [x] **Customer Quick Search & Job History:** Fast, responsive field mobile view.
- [x] **Real-Time WebSockets Integration:** Live Socket.IO progress streaming in mobile client.

---

## 💻 Phase 4: React 19 Web Dashboard (Weeks 5–6)
- [x] **Vite + React 19 + Tailwind CSS Setup:** Matching dark tech theme with glassmorphism design tokens.
- [x] **Interactive Waveform Player (Wavesurfer.js):** Audio playback with live playback speed, seek controls, and waveform canvas.
- [x] **Word-Synchronized Transcript Viewer:** Click-to-jump word timestamps in transcripts syncing audio to that exact moment.
- [x] **AI Extracted CRM Entity Inspector:** Full breakdown of customer info, diagnosis summary, parts used, financials, and action items.
- [x] **One-Click AI Correction Drawer:** In-browser prompt adjustments for instant re-extraction.
- [x] **Customer CRM Directory:** Searchable roster with voice note timeline drawer.
- [x] **Job & Task Kanban Board:** Column pipeline (`Scheduled`, `In Progress`, `Completed`) with interactive task checkboxes.
- [x] **In-Browser Voice Recording & File Uploader:** Direct audio capture modal with real-time Socket.IO pipeline progress bar.

---

## 🚀 Phase 5: Export, Integrations & Production (Week 7)
- [ ] **PDF Inspection Report Generator:** One-click customer-ready summary export.
- [ ] **Webhook & Integration Gateway:** Zapier/Make integrations for syncing to QuickBooks/HubSpot.
- [x] **Docker & Docker-Compose:** Containerized deployment for API, Worker, Redis, and Postgres.
- [x] **E2E Integration Testing:** Automated tests covering audio ingestion ➔ worker ➔ entity creation.
