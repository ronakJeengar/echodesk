# 🎙️ EchoDesk — AI Voice Agent & Field Operations CRM

> **Turn natural on-site speech from field contractors into structured CRM entries, jobs, parts lists, quotes, and follow-up tasks in seconds.**

[![Architecture](https://img.shields.io/badge/Architecture-Event--Driven-blue.svg)](docs/ARCHITECTURE.md)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748.svg)](docs/DATABASE_SCHEMA.md)
[![Frontend](https://img.shields.io/badge/Web-React%2019-61DAFB.svg)](docs/ARCHITECTURE.md)
[![Training Manual](https://img.shields.io/badge/Training%20Manual-User%20Guide-emerald.svg)](USER_TRAINING_MANUAL.md)
[![Tests](https://img.shields.io/badge/Tests-21%2F21%20Passing-brightgreen.svg)](#-testing--verification)

---

## 📖 Complete User Training Manual
👉 **Looking for full step-by-step training on how to use the Web Dashboard and Mobile App?**  
Read our [Complete User Training & Operations Manual](USER_TRAINING_MANUAL.md) covering field voice recording, offline SQLite vault sync, diagnostic calculators, equipment tag decoders, and customer tracking portals.

---

## 📖 Executive Summary
Field workers lose 15–20% of their billable day manually typing notes, filling complex forms, and drafting quotes. **EchoDesk** eliminates manual form entry with an intelligent voice-first pipeline:
1. **Speak naturally:** Field technicians record a 30–90 second on-site voice debrief.
2. **Domain-Boosted AI Extraction:** Speech-to-Text transcribes audio with trade vocabulary (HVAC, Electrical, Plumbing, Roofing, Inspection), and LLM extracts structured entities into JSON.
3. **Instant PostgreSQL CRM Persistence:** Automatically populates client profiles, dispatches work orders, schedules follow-up tasks, and streams real-time Socket.IO updates across Web & Mobile.
4. **One-Tap PDF Invoices & Dispatch:** Generates branded PDF Work Orders and sends them directly to customers via Email or SMS.

---

## 🛠️ Monorepo Structure

```
echodesk/
├── backend/          # Node.js + Express 5 + TypeScript + Prisma 7 + BullMQ + Socket.IO
├── frontend/         # React 19 + TypeScript + Vite + Tailwind CSS + Wavesurfer.js
├── mobile/           # Flutter (Dart) + Riverpod + Clean Architecture + Offline Vault
├── docs/             # PRD, Architecture, Database Schema, API Spec, Demo Guide
└── docker-compose.yml# Production container orchestration
```

---

## ⚡ Quickstart

### 1. Unified Local Development (Backend + Web)
```bash
# In the root repository:
npm install
npm run dev
```
- **Backend API & Real-Time Gateway:** `http://localhost:5001/api/v1`
- **Web Dashboard & Audio Studio:** `http://localhost:3000`

### 2. Flutter Mobile Client
```bash
cd mobile
flutter run
```

### 3. Docker Compose (1-Command Full Stack)
```bash
docker compose up --build
```

---

## ✨ Key Features & Capabilities

| Feature | Mobile App (Flutter) | Web Dashboard (React 19) |
| :--- | :---: | :---: |
| **Microphone Voice Recording** | Real-time Amplitude Waveform | In-Browser Audio Recorder & Uploader |
| **Trade Vocabulary Selector** | 🔥 HVAC, ⚡ Electrical, 🔧 Plumbing | Specialized Domain Prompt Profiles |
| **Synchronized Transcript Player** | Word-seekable timestamp highlighting | Interactive Wavesurfer.js Audio Player |
| **Structured Entity Inspector** | Extracted Customer, Parts, Labor | Financial Breakdown & Match Score |
| **One-Click AI Correction** | In-app Prompt Adjuster Bottom Sheet | Prompt Correction Modal |
| **PDF Work Order Invoices** | Native Share Sheet & Print Support | Printable & Downloadable PDF |
| **Customer Invoice Dispatch** | Direct Email & SMS Modal | One-Click Email/SMS Sender |
| **Customer CRM & Timeline** | Client Profiles & Voice History | Activity Timeline & Search Directory |
| **Jobs & Action Tasks** | Interactive Tasks Checklist | 3-Column Kanban Board |
| **Offline Audio Vault** | SQLite Cached Basements Mode | Background Auto-Sync Recovery |
| **Outbound Webhooks Gateway** | — | Zapier / QuickBooks / Make HMAC Signing |

---

## 🧪 Testing & Verification

Run the entire test suite across Backend and Mobile with a single command:

```bash
npm test
```

```
✓ tests/crm-timeline.test.ts (2 tests)
✓ tests/ai-pipeline.test.ts (6 tests)
✓ tests/auth-and-api.test.ts (9 tests)
✓ mobile/test/domain_models_test.dart (3 tests)
✓ mobile/test/widget_test.dart (1 test)

21/21 Tests Passed (100% Green)
```

---

## 📚 Complete Project Documentation

- 🎙️ [**Live Demo Walkthrough & Speech Scripts**](docs/DEMO_WALKTHROUGH.md)
- 📄 [**Product Requirements Document (PRD)**](docs/PRD.md)
- 🏗️ [**System Architecture & Audio Pipeline**](docs/ARCHITECTURE.md)
- 🗄️ [**PostgreSQL Database Schema & Prisma Models**](docs/DATABASE_SCHEMA.md)
- 🔌 [**API & WebSocket Protocol Specification**](docs/API_SPECIFICATION.md)
- 🗺️ [**Milestone Roadmap**](docs/ROADMAP.md)
