# 🎙️ EchoDesk — AI Voice Agent & Field Operations CRM

> **Turn natural on-site speech into structured CRM entries, jobs, quotes, and tasks in seconds.**

[![Architecture](https://img.shields.io/badge/Architecture-Event--Driven-blue.svg)](docs/ARCHITECTURE.md)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748.svg)](docs/DATABASE_SCHEMA.md)
[![Frontend](https://img.shields.io/badge/Web-React%2019-61DAFB.svg)](docs/ARCHITECTURE.md)
[![Mobile](https://img.shields.io/badge/Mobile-Flutter-02569B.svg)](docs/ARCHITECTURE.md)

---

## 📖 Executive Summary
Field workers lose 15–20% of their day manually typing notes, updating CRMs, and drafting quotes. **EchoDesk** replaces manual form entry with an intelligent voice pipeline:
1. **Speak naturally:** Field technicians record a 30–90 second voice debrief on-site.
2. **AI Transcribes & Extracts:** Speech-to-Text converts audio, and an LLM extracts customers, work done, parts used, costs, and follow-up deadlines into structured JSON.
3. **Instant CRM Sync:** Automatically creates customer records, schedules tasks, and syncs across Web & Mobile in real-time.

---

## 📚 Complete Project Documentation

| Document | Purpose |
| :--- | :--- |
| 📄 [**Product Requirements Document (PRD)**](docs/PRD.md) | Personas, problem statement, user flows, and success KPIs |
| 🏗️ [**System Architecture**](docs/ARCHITECTURE.md) | High-level diagrams, audio pipeline, workers, and tech stack |
| 🗄️ [**Database Schema**](docs/DATABASE_SCHEMA.md) | Full PostgreSQL models, Prisma 7 schema, and ER diagram |
| 🔌 [**API & WebSocket Specification**](docs/API_SPECIFICATION.md) | REST endpoints, S3 pre-signed upload flow, and Socket.IO events |
| 🗺️ [**Engineering Roadmap**](docs/ROADMAP.md) | Milestone phases and step-by-step implementation checklist |

---

## 🛠️ Technology Stack

```
echodesk/
├── backend/          # Node.js + Express 5 + TypeScript + Prisma + BullMQ
├── frontend/         # React 19 + Vite + Tailwind CSS v4 + Wavesurfer.js
├── mobile/           # Flutter + Riverpod + Clean Architecture + Offline Vault
└── docs/             # PRD, Architecture, Schema, and API specifications
```

* **Backend:** Node.js (Express 5), TypeScript, PostgreSQL, Prisma 7, Redis, BullMQ, Socket.IO.
* **AI & Ingestion:** Deepgram Nova-2 / Whisper API (STT), Claude 3.5 Sonnet / GPT-4o / Gemini (Structured Extraction), AWS S3 / Cloudflare R2.
* **Web Client:** React 19, TypeScript, Vite, TanStack Query v5, Tailwind CSS v4, Wavesurfer.js.
* **Mobile Client:** Flutter, Dart, Riverpod, GoRouter, Dio, SQLite (Offline Audio Vault).

---

## 🚀 Next Steps
Review the planning documents in `/docs` and proceed with initializing the backend or mobile project scaffolding!
