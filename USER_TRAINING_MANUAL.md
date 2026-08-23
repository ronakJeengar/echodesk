# 📘 EchoDesk — Comprehensive User Training Manual & Operations Guide
> **AI Voice Agent & Field Operations CRM for Modern Trade Contractors**
> *Covering Web Dispatch Dashboard & Field Technician Mobile App (iOS & Android)*

---

## 📑 Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Getting Started & Authentication](#2-getting-started--authentication)
3. [Field Technician Mobile App Guide](#3-field-technician-mobile-app-guide)
   - [3.1 Voice Note Recording & AI Extraction](#31-voice-note-recording--ai-extraction)
   - [3.2 Offline Vault & Network Sync Engine](#32-offline-vault--network-sync-engine)
   - [3.3 Equipment Tag & Serial Number Decoder](#33-equipment-tag--serial-number-decoder)
   - [3.4 On-Site Trade Diagnostic Calculators](#34-on-site-trade-diagnostic-calculators)
   - [3.5 Job Site Photo Evidence & Damage Tagging](#35-job-site-photo-evidence--damage-tagging)
   - [3.6 Customer Self-Service Portal & Live ETA Dispatch](#36-customer-self-service-portal--live-eta-dispatch)
   - [3.7 Preventative Maintenance Agreement (PMA) Generator](#37-preventative-maintenance-agreement-pma-generator)
   - [3.8 OSHA Safety Audits & Hazard Prevention](#38-osha-safety-audits--hazard-prevention)
   - [3.9 E-Signatures & Instant Work Order Invoicing](#39-e-signatures--instant-work-order-invoicing)
4. [Office Dispatch & Management Web Dashboard Guide](#4-office-dispatch--management-web-dashboard-guide)
   - [4.1 Fleet Operations Timeline & Live Feed](#41-fleet-operations-timeline--live-feed)
   - [4.2 AI Entity Inspector & Voice Corrections](#42-ai-entity-inspector--voice-corrections)
   - [4.3 Customer CRM & Automated Follow-Up Composer](#43-customer-crm--automated-follow-up-composer)
   - [4.4 5-Star Customer Review Request Engine](#44-5-star-customer-review-request-engine)
   - [4.5 Material Margin & Job Profitability Estimator](#45-material-margin--job-profitability-estimator)
   - [4.6 Trade Analytics & Financial Telemetry](#46-trade-analytics--financial-telemetry)
5. [Best Practices, FAQs & Troubleshooting](#5-best-practices-faqs--troubleshooting)

---

## 1. System Overview & Architecture

**EchoDesk** bridges the gap between field technicians and office dispatchers. Instead of filling out cumbersome paperwork or typing on tiny keyboards while wearing work gloves, field technicians speak naturally after every service call or diagnostic inspection.

```
       ┌────────────────────────────────────────────────────────────┐
       │               FIELD TECHNICIAN (Mobile App)                │
       │  • Speaks 30-90s audio debrief into phone microphone       │
       │  • Works 100% offline in basements & rural areas           │
       └─────────────────────────────┬──────────────────────────────┘
                                     │ (Audio Upload / Sync)
                                     ▼
       ┌────────────────────────────────────────────────────────────┐
       │                 ECHODESK AI CLOUD PIPELINE                 │
       │  1. Speech-to-Text (STT) with Trade Vocabulary Biasing     │
       │  2. LLM Structured Entity Extraction (JSON format)         │
       │  3. Auto-Upsert to PostgreSQL CRM & Timeline Generation    │
       └─────────────────────────────┬──────────────────────────────┘
                                     │ (Real-Time WebSockets)
                                     ▼
       ┌────────────────────────────────────────────────────────────┐
       │             OFFICE DISPATCH & WEB CRM DASHBOARD            │
       │  • Live Work Order Inspector & Invoice Dispatch            │
       │  • Customer Tracking Portal, PMA Agreements & Analytics    │
       └────────────────────────────────────────────────────────────┘
```

---

## 2. Getting Started & Authentication

### 🔑 1-Tap Demo Access vs. Custom Registration
Both the Web Dashboard and Mobile App feature instant 1-tap demo credentials for quick onboarding:

- **Web Dashboard**:
  - Open `http://localhost:3000` (or your deployed URL).
  - Click the **User Profile Badge** in the top-right navbar.
  - Click **"1-Click Login"** (*Alex Miller · Lead Field Tech*) or enter your contractor credentials.
- **Mobile App**:
  - Launch the **EchoDesk** app.
  - On the initial **Sign In** screen, tap **"1-Tap Sign In"** to instantly load the workspace.
  - To register a new contracting company, toggle to **"Create Account"**, enter your business name, email, and password.

---

## 3. Field Technician Mobile App Guide

### 3.1 Voice Note Recording & AI Extraction
1. Tap the glowing **Microphone Button** on the bottom navigation bar or tap **"Start Voice Note"** on the dashboard.
2. Select your trade category: `HVAC`, `Plumbing`, `Electrical`, `Roofing`, or `General Contracting`.
3. Speak naturally. A recommended script template:
   > *"Hey dispatch, finished at Sarah Jenkins, 742 Evergreen Terrace. Found a blown 45/5 microfarad dual-run capacitor and low R-410A refrigerant on her Carrier rooftop unit. Replaced the capacitor, added 1.5 lbs refrigerant, cleaned coils. Quoted amount is $385. Customer signed off. Need to order two spare capacitors for truck inventory tomorrow."*
4. Tap **"Stop & Process with AI"**.
5. The audio is transcribed with sub-second latency, and the AI automatically extracts:
   - **Customer Details**: Name, address, phone.
   - **Scope of Work**: Mechanical issues and actions taken.
   - **Parts & Materials**: Exact part numbers, quantities, and prices.
   - **Financials**: Labor, parts, subtotal, and tax.
   - **Follow-up Tasks**: Internal reminders (e.g. restock truck parts).

---

### 3.2 Offline Vault & Network Sync Engine
- **Off-Grid Capabilities**: When working in basements, steel industrial buildings, or rural dead zones with zero cell reception, EchoDesk automatically saves your audio recordings and metadata into the local **AES-256 encrypted SQLite Vault**.
- **Syncing Back to CRM**:
  - When you return to network coverage or Wi-Fi, the dashboard displays:  
    `"1 Offline Voice Note Cached. Ready to sync with PostgreSQL CRM."`
  - Tap **"Sync Now"**. The queue automatically uploads audio files, runs cloud AI extraction, and updates the dispatch schedule without losing any data.

---

### 3.3 Equipment Tag & Serial Number Decoder
1. Open the dashboard and tap **"Decoder"** in the Field Tools bar.
2. Type in or scan the serial/model number (e.g. `48TCEA06A2A5A0A0` for Carrier or `XR14-036-230` for Trane).
3. The engine decodes:
   - **Nominal Capacity**: 5.0 Tons / 60,000 BTU/h.
   - **Efficiency Rating**: 14.5 SEER2.
   - **Electrical Specs**: 208/230V, 3-Phase, 60Hz.
   - **Refrigerant Type**: R-410A.
   - **Manufacturing Date**: July 2021 (Warranty Active).

---

### 3.4 On-Site Trade Diagnostic Calculators
Tap **"Calculators"** on the dashboard to access 3 specialized field formulas:
1. **HVAC Airflow CFM**: Calculates total CFM from duct dimensions (Width × Height) and measured air velocity (FPM).
2. **Electrical Voltage Drop**: Calculates percentage voltage drop based on circuit voltage (120V / 240V / 480V), running amperage, wire gauge (AWG), and one-way run distance (Feet).
3. **Plumbing Pipe Fall**: Calculates required vertical slope drop for DWV pipes based on total pipe run and slope ratio (1/4" or 1/8" per foot).

---

### 3.5 Job Site Photo Evidence & Damage Tagging
1. Open any recording detail page and tap **"Site Photos"**.
2. Capture or review **Before**, **During**, and **After** photos.
3. Tap on images to apply interactive visual damage callouts:
   - `Damaged Capacitor`
   - `Arc Burn / Thermal Stress`
   - `Refrigerant Line Frost`
   - `Corroded Flue Vent`

---

### 3.6 Customer Self-Service Portal & Live ETA Dispatch
1. On the recording detail page, tap **"Customer Portal"**.
2. Tap **"Send SMS"** to text the client a secure live link: `https://echodesk.app/portal/job-101-sarah-jenkins`.
3. The customer can track your live status (`En Route`, `On-Site Working`, `Job Completed`), view technician certifications, and settle their invoice online via credit card.

---

### 3.7 Preventative Maintenance Agreement (PMA) Generator
1. Tap **"PMA Proposal"** on the recording screen.
2. Select coverage tier:
   - **Silver Seasonal Care**: $19/mo ($199/yr) — 2 tune-ups + 5% discount.
   - **Gold Priority Club**: $29/mo ($299/yr) — 2 tune-ups, 15% discount, same-day dispatch.
   - **Platinum Peace of Mind**: $49/mo ($499/yr) — 4 quarterly tune-ups, 25% discount, 2-hr VIP response.
3. Tap **"Copy Proposal Text"** or **"Enroll Customer"** to bind recurring service agreements.

---

### 3.8 OSHA Safety Audits & Hazard Prevention
1. Tap **"Safety Audit"** to generate an automated job site safety inspection.
2. Verify:
   - Electrical Lockout / Tagout (LOTO) verified.
   - PPE (Safety glasses, insulated gloves, steel-toe boots).
   - Refrigerant recovery machine grounded with zero atmospheric venting.
   - Job site cleared of debris and fire hazards.

---

### 3.9 E-Signatures & Instant Work Order Invoicing
1. Have the homeowner sign with their finger directly on the mobile screen.
2. Tap **"Generate PDF Work Order"**.
3. EchoDesk compiles parts, labor, before/after photos, e-signature, and warranty into a branded PDF ready to print or email.

---

## 4. Office Dispatch & Management Web Dashboard Guide

### 4.1 Fleet Operations Timeline & Live Feed
- View all active field technicians on a real-time chronological timeline.
- Real-time WebSockets dynamically insert new voice notes as technicians complete debriefs.

### 4.2 AI Entity Inspector & Voice Corrections
- Click on any recording card in the dashboard.
- The **Entity Inspector** displays:
  - Synchronized Waveform Audio Player with word-by-word highlighted playback.
  - Interactive line item editor (edit customer address, part prices, or job categories).
  - **Correction Prompt**: Need to adjust an estimate? Type *"Increase labor hours by 1.5 and add 10% senior discount"* and click **Apply Correction**. The AI updates all downstream figures automatically.

### 4.3 Customer CRM & Automated Follow-Up Composer
- Access customer service histories, installed equipment lists, and total customer lifetime value (LTV).
- Click **"Follow-Up Composer"** to automatically generate warm, professional SMS or email follow-ups with 1 click.

### 4.4 5-Star Customer Review Request Engine
- Automatically dispatch personalized Google / Yelp review requests via SMS after job completion.

### 4.5 Material Margin & Job Profitability Estimator
- Enter wholesale parts cost and target gross margin (e.g. 45%). EchoDesk calculates exact contractor retail pricing and profit dollars.

### 4.6 Trade Analytics & Financial Telemetry
- Track revenue velocity, average job tickets, volume by trade (HVAC vs. Plumbing vs. Electrical), and top utilized parts.

---

## 5. Best Practices, FAQs & Troubleshooting

### 💡 Field Recording Best Practices
1. **Minimize Wind Noise**: In outdoor rooftop settings, shield phone microphone with your palm.
2. **State Numbers Clearly**: Say *"Three hundred eighty-five dollars"* or *"Three eight five dollars"*.
3. **Mention Trade Names**: Mentioning equipment brands (*Carrier, Trane, Rheem, Square D, Moen*) helps the AI optimize trade vocabulary lookups.

### ❓ Frequently Asked Questions
- **Q: What happens if I lose Wi-Fi during a recording?**  
  *A:* The app continues recording and saves the audio to your local SQLite vault. Tap **"Sync Now"** when back online.
- **Q: Can dispatch edit invoices after the tech leaves?**  
  *A:* Yes. Any updates made in the Web Entity Inspector synchronize instantly across all devices.
- **Q: How secure is customer payment and audio data?**  
  *A:* All communication is secured via TLS 1.3 encryption, and data at rest in PostgreSQL is encrypted using AES-256.

---

*© 2026 EchoDesk Technologies Inc. All rights reserved.*
