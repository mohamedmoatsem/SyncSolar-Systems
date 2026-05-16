�

�
￼
☀️ SyncSolar Systems
AI-Powered Solar Energy Monitoring & Control Platform for Africa
Built in Sudan. Designed for Africa's Energy Future.
�
�
�
�
�
�
�
Load image
Load image
Load image
Load image
Load image
Load image
Load image
🌐 Live Demo · 📖 API Docs · 🚀 Quick Start · 📊 Impact
�

🌍 The Problem We Solve
"Sudan is among the top countries projected to remain without electricity access in 2030."
— IEA / World Bank, Tracking SDG7 Report 2025
In Sudan and across conflict-affected Africa, solar energy is not a luxury — it is a matter of survival. Thousands of solar installations power hospitals, schools, farms, and homes with no reliable grid alternative. Yet the vast majority of these systems operate completely blind — no monitoring, no alerts, no intelligent management.
Challenge
Data
Source
Electricity access gap
Over 60% of Sudan's population lacks reliable electricity
IEA / World Bank, 2024
War-damaged infrastructure
40% of Sudan's power generation capacity destroyed since 2023
Middle East Council on Global Affairs, 2025
Fuel import dependency
$1.3 billion/year spent on fuel imports for electricity generation
MECGA, 2025
Untapped solar potential
Solar contributes less than 0.23% of Sudan's electricity mix despite enormous potential
Wiley Engineering Reports, 2025
Government solar ambition
Sudan targets 2,190 MW of grid-connected solar PV by 2035
Sudan Ministry of Energy
Falling solar costs
Projected to drop to $35/MWh by 2025 and $25/MWh by 2035
MECGA / IEA
The real gap is not solar panels — it is intelligence. Thousands of installations across hospitals, schools, farms, and remote areas operate with zero visibility into their performance, leading to:
📉 15–30% efficiency losses from undetected faults and suboptimal operation
🔋 Thousands of dollars in battery damage due to improper charging cycles
🛠️ Costly emergency maintenance that could be prevented with early warnings
⚡ No remote control over devices consuming power unnecessarily
SyncSolar closes this gap.
✨ What is SyncSolar Systems?
SyncSolar Systems is an integrated SCADA + IoT + AI platform that gives solar energy owners, installers, and operators across Africa real-time intelligence over their installations — from a single system to hundreds, from a smartphone to a full control room.
┌─────────────────────────────────────────────────────────────────┐
│                    SyncSolar Architecture                        │
│                                                                  │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │  IoT Devices │    │   API Server    │    │  Mobile App   │  │
│  │  (Hardware)  │───▶│  Express 5 +    │◀──▶│  Expo/React   │  │
│  │              │    │  TypeScript     │    │   Native      │  │
│  │  Inverters   │    │   Port 8080     │    └───────────────┘  │
│  │  Sensors     │    │                 │    ┌───────────────┐  │
│  │  Controllers │    │  PostgreSQL DB  │◀──▶│   Web SCADA   │  │
│  │  Smart Meters│    │  Drizzle ORM    │    │  React/Vite   │  │
│  └──────────────┘    │                 │    └───────────────┘  │
│  ESP32 / RPi /       │  Gemini AI 2.5  │                       │
│  Modbus / MQTT       │  Flash          │                       │
│                      └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
🚀 Key Features
📡 1. Real-Time SCADA Dashboard
A live control dashboard that refreshes every 10 seconds, displaying:
Voltage (V), Current (A), Power (W), Solar Irradiance (W/m²)
Battery State of Charge (SoC %), Battery Voltage, Inverter Temperature
Hourly energy production charts with historical trends
Performance indicators: Performance Ratio (PR), Capacity Utilization Factor (CUF)
Multi-system overview for technicians managing hundreds of installations
🔌 2. Multi-Protocol IoT Integration
SyncSolar connects to any hardware — no proprietary lock-in:
Hardware
Protocol
Update Interval
ESP32 / Arduino
HTTP POST
Every 30 seconds
Raspberry Pi + RS485
Modbus RTU → REST API
Every 30 seconds
Smart Inverters (Solis / SMA / Growatt)
Modbus TCP / HTTP
Every 60 seconds
MQTT Devices
MQTT Broker → API Bridge
Real-time
Batch Upload
HTTP POST (multi-reading)
Flexible
🤖 3. AI Solar Assistant (Gemini 2.5 Flash)
Unlike generic chatbots, the SyncSolar AI assistant is injected with your system's live data on every query:
🔍 Fault diagnostics with full error code reference (F001–F050)
📐 Cable and protection sizing calculations for safe installations
📈 I-V curve analysis and performance benchmarking
🗓️ Preventive maintenance schedules tailored to your system
⚡ Real-time answers streamed via SSE (Server-Sent Events)
🌍 Full bilingual support — English and Arabic
🔔 4. Intelligent Alert System
Proactive alerts before failures become crises:
Battery low charge, high inverter temperature, inverter fault codes
Sudden irradiance drop (cloud/dust), cable insulation degradation
Severity classification: critical / warning / info
Full alert history with resolution timestamps and technician notes
🎛️ 5. Remote Device Control
Toggle individual electrical devices on/off from anywhere in the world
Monitor real-time consumption per device in watts
Track cumulative kWh per device for energy accounting
Ideal for managing pumps, AC units, and critical loads in remote installations
👥 6. Role-Based Access Control
Action
Client
Technician
View own system data
✅
✅
View all systems
❌
✅
Add manual readings
❌
✅
Resolve alerts
❌
✅
Toggle devices
✅
✅
AI assistant
✅
✅
Send IoT data
✅*
✅
*via X-IoT-Key or JWT
🔐 7. Industrial-Grade Security
Layer
Protection
Transport
TLS 1.3 — all data encrypted in transit
User authentication
JWT (HS256, 7-day expiry)
IoT device authentication
X-IoT-Key shared secret header
Password storage
bcrypt (12 rounds) — one-way hashing
Data isolation
Each user sees only their own system(s)
🛠️ Tech Stack
Backend (API Server)
├── Runtime:         Node.js v24
├── Framework:       Express.js v5 + TypeScript 5.9
├── Database:        PostgreSQL + Drizzle ORM
├── Validation:      Zod v4 + drizzle-zod
├── Auth:            JWT (jsonwebtoken) + bcrypt
├── AI:              Google Gemini 2.5 Flash (SSE streaming)
├── Build:           esbuild (CJS bundle)
└── Monorepo:        pnpm workspaces

Frontend (Web SCADA Dashboard)
├── Framework:       React + Vite
├── Language:        TypeScript
└── API Hooks:       Orval (auto-generated from OpenAPI spec)

Mobile Application
└── Framework:       Expo / React Native

IoT Hardware Integration
├── Protocols:       HTTP REST, Modbus RTU/TCP, MQTT, RS485
├── Hardware:        ESP32, Raspberry Pi, Smart Inverters
└── Languages:       C++ (Arduino Framework), Python 3

DevOps & Tooling
├── Package Manager: pnpm
├── API Code Gen:    Orval (OpenAPI → TypeScript hooks + Zod schemas)
└── Type Safety:     tsc strict mode across all packages
📁 Project Structure
SyncSolar-Systems/
├── .agents/                  # AI agent configurations
├── artifacts/                # Build artifacts & compiled output
├── attached_assets/          # Static assets & documentation media
├── lib/                      # Shared libraries & utility packages
├── scripts/                  # Automation & deployment scripts
├── HOW_IT_WORKS.md           # Full technical integration guide (IoT, API, DB)
├── replit.md                 # Workspace & monorepo configuration
├── package.json              # Root package manifest
├── pnpm-workspace.yaml       # Monorepo workspace definition
├── tsconfig.json             # TypeScript project references
└── tsconfig.base.json        # Shared TypeScript base configuration
⚡ Quick Start
Prerequisites
node --version    # v24+
pnpm --version    # v9+
# PostgreSQL database (local or cloud)
1. Clone the Repository
git clone https://github.com/mohamedmoatsem/SyncSolar-Systems-.git
cd SyncSolar-Systems-
2. Install Dependencies
pnpm install
3. Configure Environment Variables
cp .env.example .env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/syncsolar

# Security
JWT_SECRET=your-256-bit-random-secret-key
IOT_API_KEY=your-secret-iot-key-minimum-32-chars

# AI
GEMINI_API_KEY=your-google-gemini-api-key

# Server
PORT=8080
NODE_ENV=development
4. Initialize the Database
pnpm --filter @workspace/db run push
5. Start the API Server
pnpm --filter @workspace/api-server run dev
6. Verify the Server is Running
curl http://localhost:8080/api/health
# → { "status": "ok", "version": "2.0" }
7. Connect Your First IoT Device
curl -X POST http://localhost:8080/api/device-consumption \
  -H "Content-Type: application/json" \
  -H "X-IoT-Key: your-iot-key" \
  -d '{
    "solarSystemId": 1,
    "deviceName": "Main Inverter",
    "currentConsumptionWatts": 2500.0,
    "totalKwh": 145.33
  }'
# → HTTP 201 Created
All Available Commands
pnpm run typecheck                              # Full TypeScript type check
pnpm run build                                  # Build all packages
pnpm --filter @workspace/api-spec run codegen   # Regenerate API hooks from OpenAPI
pnpm --filter @workspace/db run push            # Push DB schema changes (dev)
pnpm --filter @workspace/api-server run dev     # Run API server locally
📡 API Reference
Authentication
Method
Endpoint
Description
POST
/api/auth/register
Create a new user account
POST
/api/auth/login
Login → returns JWT token
GET
/api/auth/me
Get current authenticated user
Live Dashboard
Method
Endpoint
Description
GET
/api/dashboard/summary
Live system summary (power, battery, alerts)
GET
/api/dashboard/energy-today
Hourly energy production for today
GET
/api/dashboard/alerts-summary
Alert counts by severity
Device Consumption (IoT Endpoints)
Method
Endpoint
Auth
Description
POST
/api/device-consumption
X-IoT-Key or JWT
Submit a single IoT reading
POST
/api/device-consumption/batch
X-IoT-Key or JWT
Submit multiple readings at once
GET
/api/device-consumption/summary
JWT
Per-device consumption summary
GET
/api/device-consumption/history
JWT
Historical consumption log
Alerts & Devices
Method
Endpoint
Description
GET
/api/alerts
Get all alerts (active + resolved)
PATCH
/api/alerts/:id/resolve
Mark an alert as resolved
GET
/api/devices
List all devices with current status
PATCH
/api/devices/:id/toggle
Toggle device on/off remotely
AI Assistant
Method
Endpoint
Description
POST
/api/gemini/conversations
Start a new AI conversation
POST
/api/gemini/conversations/:id/messages
Send a message (SSE stream response)
GET
/api/gemini/conversations
List all conversations
DELETE
/api/gemini/conversations/:id
Delete a conversation
💡 IoT Integration Guide
ESP32 (Arduino Framework)
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* API_URL     = "https://YOUR_DOMAIN/api/device-consumption";
const char* IOT_API_KEY = "your-iot-api-key";
const int   SYSTEM_ID   = 1;

void sendReading(float watts, float kwh) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-IoT-Key", IOT_API_KEY);

  StaticJsonDocument<256> doc;
  doc["solarSystemId"]           = SYSTEM_ID;
  doc["deviceName"]              = "ESP32 Main Meter";
  doc["currentConsumptionWatts"] = watts;
  doc["totalKwh"]                = kwh;

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  http.end();
}
Raspberry Pi + Modbus RTU (Python)
import requests
from pymodbus.client import ModbusSerialClient

API_URL = "https://YOUR_DOMAIN/api/device-consumption"
IOT_KEY = "your-iot-key"

def send_reading(name, watts, kwh):
    requests.post(
        API_URL,
        json={
            "solarSystemId": 1,
            "deviceName": name,
            "currentConsumptionWatts": watts,
            "totalKwh": kwh
        },
        headers={"X-IoT-Key": IOT_KEY}
    )
📖 For the complete integration guide including full ESP32 firmware, Raspberry Pi Modbus gateway, MQTT bridge, JWT auth flow, and wiring diagrams — see HOW_IT_WORKS.md
🗄️ Database Schema
solar_systems       -- Managed solar installations
users               -- Users with roles: client | technician
sensor_readings     -- V, A, W, SoC%, Temp, Irradiance — logged every 5 minutes
alerts              -- Alerts with severity levels and resolution tracking
devices             -- Electrical devices with power ratings and status
device_consumption  -- Real-time IoT consumption per device (watts + cumulative kWh)
conversations       -- AI assistant conversation sessions
messages            -- Individual messages per conversation (user | assistant)
🔧 Safe Operating Thresholds
The platform monitors these parameters and fires alerts automatically:
Parameter
Normal Range
Alert Triggered When
DC Panel Voltage
350–550 V
< 150 V or > 900 V
Battery State of Charge
40–90%
< 20% → Critical alert
Inverter Temperature
30–55°C
> 65°C
Solar Irradiance
400–900 W/m²
Sudden drop > 50%
Performance Ratio
75–85%
< 70%
Cable Insulation Resistance
> 1 MΩ
< 200 kΩ → Immediate shutdown
📊 Impact & Market Opportunity
Direct Impact in Sudan & Conflict-Affected Africa
Sector
How SyncSolar Helps
🏥 Hospitals & Clinics
Continuous power visibility = life-critical operations protected
🏫 Schools
Stable learning environments in areas without grid electricity
🌾 Farms & Irrigation
Reliable, remotely monitored water pumping
🏘️ Off-Grid Communities
Smart management of shared solar microgrids
📡 Telecom Towers
Remote energy monitoring in areas with no road access
Scalable Business Model
Free Tier        →  Individual households and small farms
Professional     →  Monthly subscription for solar installers & operators
Enterprise       →  Custom deployments for governments & NGOs
Target Markets
Market
Opportunity
Priority
Sudan
2,190 MW solar target by 2035; 60%+ population unelectrified
🔴 Primary
Ethiopia
5M+ off-grid households; strong solar pipeline
🟡 Secondary
Chad / Niger / Mali
Conflict zones with acute energy poverty
🟡 Secondary
Sub-Saharan Africa
600M+ people without reliable electricity
🟢 Long-term
🏆 Why SyncSolar for RAISEAfrica 2026?
"Africa's energy transition requires bold innovation and scalable solutions."
— RAISEAfrica 2026
SyncSolar directly addresses every RAISEAfrica evaluation criterion:
Criterion
How SyncSolar Delivers
Innovation
First Arabic-native SCADA + AI platform built for the African off-grid solar market
Impact
Addresses the energy crisis in conflict-affected regions where it matters most
Scalability
Monorepo API architecture supports thousands of systems from a single deployment
Business Model
SaaS model applicable across all 54 African countries
Technology
IoT + SCADA + Gemini AI — next-generation stack built on open standards
Local Relevance
Built in Sudan, by a Sudanese founder, for real African problems
Inclusion
Bilingual (EN/AR) interface; mobile-first for rural operators
🗺️ Roadmap
[x] v1.0 — SCADA Dashboard + IoT Integration (HTTP / Modbus)
[x] v2.0 — Gemini AI Assistant + Role-Based Auth + Batch IoT API
[ ] v2.5 — Mobile App (Expo) public release
[ ] v3.0 — Native MQTT support + Predictive Maintenance AI
[ ] v3.5 — Satellite connectivity for remote off-grid areas
[ ] v4.0 — Multi-tenant SaaS marketplace for Sudan & Africa
🤝 Contributing
Contributions are welcome — especially from African developers and solar energy engineers.
# Fork the repository, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request
📄 License
MIT License — free to use, modify, and distribute with attribution.
👤 About the Developer
Mohamed Moatsem — Engineer & Entrepreneur, Sudan
I built SyncSolar from Sudan, for Africa. Every line of code was written with the understanding that electricity in my country is not a convenience — it is the difference between life and death for hospitals, clinics, farms, and schools that depend entirely on solar energy with no alternative.
SyncSolar is my answer to a real problem I live every day.
�
Load image
�

☀️ SyncSolar Systems — From Sudan, For Africa
Turning sunlight into data. Turning data into power.
⭐ If you find this project valuable, please consider starring the repository!
�
