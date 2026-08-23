# 🎙️ EchoDesk — Live Field Operations Demo Walkthrough

EchoDesk converts on-site spoken voice notes from field contractors into structured CRM entries, jobs, parts lists, and customer invoices in seconds.

---

## 🚀 1. Quickstart: Launching the Full Stack

### Option A: Local Multi-Process Dev (Recommended)
```bash
# In the root repository:
npm run dev
```
- **Backend API & Socket Gateway:** `http://localhost:5001/api/v1`
- **Web Dashboard & Audio Studio:** `http://localhost:3000`

### Option B: Flutter Mobile App
```bash
cd mobile
flutter run
```

### Option C: Docker Full Stack
```bash
docker compose up --build
```

---

## 🛠️ 2. Live Demo Voice Transcripts (Read into Mic)

### Scenario 1: HVAC Emergency AC Compressor Diagnostic
> *"Just wrapped up the diagnostic at Sarah Jenkins' office over at Apex Logistics. The outdoor AC condenser unit was humming but not spinning. Tested the 45/5 MFD dual run capacitor and it was completely blown. Swapped it out with a fresh 45/5 MFD capacitor and tested the R-410A refrigerant pressure. System is blowing cold at 54 degrees now. Total bill is $285 including $42 for the capacitor and 1.5 hours of labor. Please send invoice #4092 to Sarah Jenkins by Friday, and schedule a 6-month seasonal tune-up for February."*

**AI Extraction Results:**
- **Customer:** Sarah Jenkins (Apex Logistics)
- **Job:** AC Capacitor Diagnostic & Replacement ($285.00)
- **Parts:** 1x 45/5 MFD Dual Run Capacitor ($42.00)
- **Labor:** 1.5 Hours ($142.50)
- **Tasks:** Send Invoice #4092 (Due Friday), Schedule 6-month tune-up (February)

---

### Scenario 2: Electrical Main Panel Upgrade & Permitting
> *"Completed inspection for David Ramirez at 1204 Oak Ridge Way. Upgraded the main subpanel to a 200 amp Square D breaker panel. Replaced two ungrounded kitchen outlets with 20-amp GFCI receptacles. Total quoted amount was $1,450. Tech labor was 4 hours. Remind tech to pull the final county electrical permit inspection by next Monday."*

**AI Extraction Results:**
- **Customer:** David Ramirez (1204 Oak Ridge Way)
- **Job:** 200A Main Panel Upgrade ($1,450.00)
- **Parts:** 1x Square D 200A Breaker Panel, 2x 20A GFCI Receptacles
- **Labor:** 4.0 Hours
- **Tasks:** Pull county electrical permit inspection (Priority: HIGH)

---

### Scenario 3: Plumbing High-Pressure Regulator & Water Heater
> *"Finished service call for Mark Henderson at 742 Evergreen Terrace. Main water pressure was spiking at 95 PSI. Replaced the faulty pressure reducing valve with a new 3/4 inch lead-free PRV valve and installed an expansion tank on the 50-gallon Rheem water heater. Quoted total was $650. Need to follow up next Tuesday to verify the pressure gauge holds at 60 PSI."*

**AI Extraction Results:**
- **Customer:** Mark Henderson (742 Evergreen Terrace)
- **Job:** Water Pressure Regulator & Expansion Tank ($650.00)
- **Parts:** 1x 3/4" Lead-Free PRV Valve, 1x Thermal Expansion Tank
- **Tasks:** Verify pressure gauge holds at 60 PSI (Due next Tuesday)

---

## 📑 3. Key Workflows to Demonstrate

1. **Trade Vocabulary Engine:** Tap `🔥 HVAC`, `⚡ Electrical`, or `🔧 Plumbing` pills to auto-boost specialized trade terminology.
2. **Interactive Waveform Player & Synchronized Transcript:** Click on any spoken word in the transcript to jump audio playback directly to that millisecond.
3. **One-Click AI Correction:** Tap **"Adjust Prompt"** to refine any extracted number, customer detail, or part without manual form editing.
4. **Instant PDF Work Order Generator:** Click **"Print / Save PDF Work Order"** on Mobile or Web to generate a branded diagnostic invoice.
5. **Customer Invoice Dispatch:** Tap **"Send Invoice to Customer"** to email or text the work order directly to the client.
6. **Offline Audio Vault:** Turn off Wi-Fi/data, record a note in the mobile app, and watch the **"Offline Queue"** automatically sync to PostgreSQL when connection resumes.
7. **Outbound Webhooks Gateway:** Go to **Settings** and test ping your Zapier, QuickBooks, or Make endpoint with HMAC-SHA256 signatures.
