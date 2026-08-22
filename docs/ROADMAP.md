# Engineering Roadmap & Implementation Plan
## EchoDesk — AI Voice Agent & Field Operations CRM

---

## 🎯 Phase 1: Core Foundation & Ingestion Backend (Weeks 1–2)
- [ ] **Repository Setup & Monorepo Structure:** `/backend`, `/frontend`, `/mobile`, `/shared`.
- [ ] **PostgreSQL & Prisma 7 Initial Schema:** User, Workspace, Membership, Customer, Recording, Job, Task.
- [ ] **Authentication & RBAC Middleware:** JWT rotation, HttpOnly cookies, Workspace scoping.
- [ ] **S3 / Cloudflare R2 Audio Ingestion:** Presigned upload URLs, audio metadata extraction (duration, format).
- [ ] **Redis & BullMQ Setup:** Asynchronous worker queue scaffolding with failure retry handling.

---

## 🎙️ Phase 2: AI Processing & Extraction Pipeline (Weeks 2–3)
- [ ] **Speech-to-Text (STT) Integration:** Deepgram Nova-2 / OpenAI Whisper API with word-level timestamps.
- [ ] **LLM Extraction Engine:** Structured JSON output via Claude 3.5 Sonnet / GPT-4o / Gemini Flash.
- [ ] **Custom Industry Vocabulary System:** Dynamic vocabulary boosting per workspace industry (HVAC, Electrical, Real Estate).
- [ ] **Automated Entity Upsert:** Automatically linking extracted customers, creating jobs, and scheduling tasks in PostgreSQL.
- [ ] **Socket.IO Event Gateway:** Live status notifications (`TRANSCRIBING` ➔ `EXTRACTING` ➔ `COMPLETED`).

---

## 📱 Phase 3: Flutter Mobile App — Voice-First Client (Weeks 4–5)
- [ ] **Clean Architecture Setup:** Core, Data, Domain, Presentation layers with Riverpod.
- [ ] **One-Tap Voice Recording UI:** Pulse animation, live audio visualizer, pause/resume.
- [ ] **Offline Audio Vault (SQLite):** Store un-synced audio files locally when off-grid; auto-upload upon reconnection.
- [ ] **Extraction Preview & Quick-Edit Sheet:** Instant visual cards for extracted parts, costs, tasks, and follow-ups.
- [ ] **Customer Quick Search & Job History:** Fast, responsive field mobile view.

---

## 💻 Phase 4: React 19 Web Dashboard (Weeks 5–6)
- [ ] **Vite + React 19 + Tailwind CSS v4 Setup:** Matching dark/light design tokens.
- [ ] **Interactive Waveform Player (Wavesurfer.js):** Click-to-jump word timestamps in transcripts.
- [ ] **Customer CRM Timeline View:** Unified activity feed for all customer notes, jobs, and estimates.
- [ ] **Job & Task Kanban Board:** Drag-and-drop workflow (`@hello-pangea/dnd` or TanStack Table).
- [ ] **Team Activity & Operational Metrics:** FL Chart / Recharts showing weekly voice hours logged and jobs completed.

---

## 🚀 Phase 5: Export, Integrations & Production (Week 7)
- [ ] **PDF Inspection Report Generator:** One-click customer-ready summary export.
- [ ] **Webhook & Integration Gateway:** Zapier/Make integrations for syncing to QuickBooks/HubSpot.
- [ ] **Docker & Docker-Compose:** Containerized deployment for API, Worker, Redis, and Postgres.
- [ ] **E2E Integration Testing:** Automated tests covering audio ingestion ➔ worker ➔ entity creation.
