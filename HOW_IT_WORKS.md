# SyncSolar Systems — كيف يعمل النظام
## How It Works: Full Technical Integration Guide

---

## نظرة عامة / Overview

SyncSolar Systems هي منصة متكاملة لمراقبة والتحكم في منظومات الطاقة الشمسية بتقنية IoT.  
تتكون من ثلاثة مكونات رئيسية تعمل معاً:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SyncSolar Architecture                        │
│                                                                  │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │  IoT Devices │    │   API Server    │    │  Mobile App   │  │
│  │  (Hardware)  │───▶│  Express/Node   │◀──▶│  Expo/React   │  │
│  │              │    │   Port 8080     │    │   Native      │  │
│  │  Inverters   │    │                 │    └───────────────┘  │
│  │  Sensors     │    │  PostgreSQL DB  │    ┌───────────────┐  │
│  │  Controllers │    │  Drizzle ORM    │◀──▶│   Web SCADA   │  │
│  │  Smart Meters│    │                 │    │  React/Vite   │  │
│  └──────────────┘    │  Gemini AI 2.5  │    └───────────────┘  │
│                      └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. طبقة أجهزة IoT / IoT Hardware Layer

### الأجهزة المدعومة / Supported Hardware

| الجهاز | Device | البروتوكول | Protocol |
|--------|--------|------------|----------|
| عاكس الطاقة | Solar Inverter | HTTP POST / Modbus TCP |
| وحدة تحكم الشحن MPPT | MPPT Charge Controller | HTTP POST / RS485 |
| مستشعر الإشعاع الشمسي | Irradiance Sensor (Pyranometer) | HTTP POST |
| مستشعر درجة الحرارة | Temperature Sensor (PT100/NTC) | HTTP POST |
| عداد الطاقة الذكي | Smart Energy Meter | HTTP POST / Modbus |
| مستشعر الجهد والتيار | Voltage/Current Sensor (CT/SCT) | HTTP POST |
| وحدة قياس البطارية | Battery Monitor (Coulomb Counter) | HTTP POST |
| ESP32 / Raspberry Pi | IoT Gateway | HTTP POST |

### مخطط التوصيل الكهربائي / Wiring Diagram

```
PV Panels (String)
    │
    │  DC Cable (4-6mm², 600-1000V rated)
    ▼
┌─────────────┐
│ String Fuse │  (1.5 × Isc per string, e.g. 15A for 10A Isc)
│ DC Combiner │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   MPPT Charge        │──── Battery Bank ──── Load Bus
│   Controller /       │     (12/24/48V)       (Distribution)
│   Hybrid Inverter    │
│                      │──── AC Grid ─────── AC Load Panel
└──────────┬──────────┘
           │
           │ RS485 / Modbus RTU / WiFi / UART
           ▼
┌─────────────────────┐
│   IoT Gateway        │
│   (ESP32 / RPi)      │
│                      │
│  Reads: V, I, P,     │
│  BattV, Temp, Irr    │
└──────────┬──────────┘
           │
           │ HTTPS POST (every 10–60 sec)
           ▼
    SyncSolar API
    /api/device-consumption
           │
           ▼
    PostgreSQL Database
           │
           ▼
    Mobile App / Web SCADA
    (auto-refresh every 10s)
```

---

## 2. ربط الأجهزة بالمنصة / Connecting Hardware to Platform

### الطريقة الأولى: HTTP POST المباشر (الأسرع والأبسط)

كل جهاز IoT يرسل قراءاته مباشرة إلى API عبر HTTPS. المصادقة تكون بمفتاح `X-IoT-Key`:

```bash
# إرسال قراءة استهلاك جهاز
curl -X POST https://YOUR_DOMAIN/api/device-consumption \
  -H "Content-Type: application/json" \
  -H "X-IoT-Key: syncsolar-iot-dev-key" \
  -d '{
    "solarSystemId": 1,
    "deviceName": "Air Conditioner Unit 1",
    "currentConsumptionWatts": 1850.5,
    "totalKwh": 142.33
  }'
```

**الاستجابة الناجحة / Success Response (HTTP 201):**
```json
{
  "id": 42,
  "solarSystemId": 1,
  "deviceName": "Air Conditioner Unit 1",
  "currentConsumptionWatts": 1850.5,
  "totalKwh": 142.33,
  "timestamp": "2026-05-15T10:30:00.000Z"
}
```

### الطريقة الثانية: إرسال دُفعي (Batch) — لتوفير النطاق الترددي

مثالي للأنظمة التي تجمع قراءات متعددة ثم ترسلها دفعة واحدة:

```bash
curl -X POST https://YOUR_DOMAIN/api/device-consumption/batch \
  -H "Content-Type: application/json" \
  -H "X-IoT-Key: syncsolar-iot-dev-key" \
  -d '{
    "readings": [
      { "solarSystemId": 1, "deviceName": "AC Unit 1",    "currentConsumptionWatts": 1850, "totalKwh": 142.3 },
      { "solarSystemId": 1, "deviceName": "Water Pump",   "currentConsumptionWatts": 750,  "totalKwh": 89.1  },
      { "solarSystemId": 1, "deviceName": "Lighting Load","currentConsumptionWatts": 120,  "totalKwh": 55.7  }
    ]
  }'
```

### الطريقة الثالثة: مصادقة JWT (للأجهزة الذكية المتقدمة)

```bash
# خطوة 1: تسجيل الدخول والحصول على الـ Token
TOKEN=$(curl -s -X POST https://YOUR_DOMAIN/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tech@syncsolar.com","password":"tech1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# خطوة 2: استخدام الـ Token للإرسال
curl -X POST https://YOUR_DOMAIN/api/device-consumption \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"solarSystemId":1,"deviceName":"Inverter Main","currentConsumptionWatts":3200,"totalKwh":891.5}'
```

---

## 3. كود ESP32 للربط الفوري / ESP32 Quick-Start Code

```cpp
// SyncSolar IoT Client — ESP32 (Arduino Framework)
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID    = "YOUR_WIFI_SSID";
const char* WIFI_PASS    = "YOUR_WIFI_PASSWORD";
const char* API_URL      = "https://YOUR_DOMAIN/api/device-consumption";
const char* IOT_API_KEY  = "syncsolar-iot-dev-key";
const int   SYSTEM_ID    = 1;
const int   INTERVAL_MS  = 30000;  // 30 ثانية

// ── أطراف المستشعرات (غيّر حسب توصيلك) ──
const int VOLTAGE_PIN = 34;   // مقسم جهد (R1=100kΩ, R2=10kΩ → نسبة 11:1)
const int CURRENT_PIN = 35;   // ACS712-20A  (100mV/A, zero at 2.5V)
const int TEMP_PIN    = 32;   // NTC 10kΩ

float totalKwh   = 0.0;
unsigned long lastSend = 0;

float readVoltage() {
  float v = analogRead(VOLTAGE_PIN) * (3.3f / 4095.0f);
  return v * 11.0f;  // مقسم الجهد
}

float readCurrent() {
  float v = analogRead(CURRENT_PIN) * (3.3f / 4095.0f);
  return (v - 2.5f) / 0.1f;  // ACS712
}

float readTemperature() {
  float adc = analogRead(TEMP_PIN);
  float R   = 10000.0f * (4095.0f / adc - 1.0f);
  float lnR = log(R);
  float Tk  = 1.0f / (1.129148e-3f + 2.34125e-4f * lnR + 8.76741e-8f * lnR * lnR * lnR);
  return Tk - 273.15f;
}

void sendReading(float watts, float kwh, float temp) {
  if (WiFi.status() != WL_CONNECTED) return;

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
  Serial.printf("[IoT] %s  %.1fW | %.3f kWh | %.1f°C  → HTTP %d\n",
    code == 201 ? "✓" : "✗", watts, kwh, temp, code);
  http.end();
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.printf("\n✅ Connected: %s\n", WiFi.localIP().toString().c_str());
}

void loop() {
  float V    = readVoltage();
  float I    = readCurrent();
  float W    = V * I;
  float T    = readTemperature();

  // تجميع الطاقة (تكامل شبه المنحرف)
  totalKwh += (W / 1000.0f) * (INTERVAL_MS / 3600000.0f);

  if (millis() - lastSend >= (unsigned long)INTERVAL_MS) {
    sendReading(W, totalKwh, T);
    lastSend = millis();
  }
  delay(1000);
}
```

---

## 4. كود Python لـ Raspberry Pi / جهاز بوابة Modbus RTU

```python
#!/usr/bin/env python3
"""
SyncSolar Gateway — Raspberry Pi
يقرأ من Modbus RTU (RS485) ويرسل إلى SyncSolar API
"""
import time, json, requests
from pymodbus.client import ModbusSerialClient

API_URL   = "https://YOUR_DOMAIN/api/device-consumption"
IOT_KEY   = "syncsolar-iot-dev-key"
SYSTEM_ID = 1
INTERVAL  = 30          # ثانية
PORT      = "/dev/ttyUSB0"

# ── خريطة سجلات Modbus (مثال: Solis / SMA / Growatt) ──
REG_DC_VOLTAGE  = 0x0003   # V × 0.1
REG_DC_CURRENT  = 0x0004   # A × 0.1
REG_AC_POWER    = 0x000D   # W
REG_BATTERY_SOC = 0x0025   # %
REG_TEMPERATURE = 0x0028   # °C × 0.1

total_kwh = 0.0

def read_inverter():
    client = ModbusSerialClient(method="rtu", port=PORT,
                                baudrate=9600, parity='N',
                                stopbits=1, bytesize=8, timeout=3)
    assert client.connect(), "Modbus connect failed"
    rr = client.read_holding_registers(REG_DC_VOLTAGE, count=50, slave=1)
    client.close()
    regs = rr.registers
    return {
        "voltage"     : regs[0] * 0.1,
        "current"     : regs[1] * 0.1,
        "power"       : regs[10],           # AC power
        "battery_soc" : regs[34],
        "temperature" : regs[37] * 0.1,
    }

def send(name, watts, kwh):
    r = requests.post(API_URL,
        json={"solarSystemId": SYSTEM_ID, "deviceName": name,
              "currentConsumptionWatts": watts, "totalKwh": kwh},
        headers={"X-IoT-Key": IOT_KEY}, timeout=10)
    r.raise_for_status()
    print(f"✅ {name}: {watts:.1f}W | {kwh:.3f} kWh")

def main():
    global total_kwh
    print(f"🚀 SyncSolar Gateway — System {SYSTEM_ID}")
    while True:
        try:
            d = read_inverter()
            total_kwh += (d["power"] / 1000) * (INTERVAL / 3600)
            send("Hybrid Inverter", d["power"], total_kwh)
        except Exception as e:
            print(f"❌ {e}")
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
```

---

## 5. مخطط تدفق البيانات الكامل / Full Data Flow

```
IoT Device (ESP32 / RPi / Smart Inverter)
    │
    │  HTTPS POST  every 10–60 s
    │  Header: X-IoT-Key: syncsolar-iot-dev-key
    │  Body:   { solarSystemId, deviceName,
    │            currentConsumptionWatts, totalKwh }
    ▼
┌────────────────────────────────────────────┐
│  API Server  (Express 5 + TypeScript)       │
│                                             │
│  1. Validate X-IoT-Key OR JWT Bearer        │
│  2. Parse & validate body (Zod schema)      │
│  3. INSERT into device_consumption table    │
│  4. Return HTTP 201 Created                 │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────┐
│  PostgreSQL  (Drizzle ORM)                  │
│                                             │
│  device_consumption                         │
│  ├─ id                serial PK             │
│  ├─ solar_system_id   FK → solar_systems    │
│  ├─ device_name       text                  │
│  ├─ current_watts     real                  │
│  ├─ total_kwh         real                  │
│  └─ timestamp         timestamptz           │
└──────────────────┬─────────────────────────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
  Mobile App (Expo)    Web SCADA (Vite)
  polls every 10s      polls every 10s
  GET /api/device-     GET /api/dashboard/
      consumption/         summary
      summary
```

---

## 6. مرجع نقاط الـ API الكاملة / Complete API Reference

### المصادقة / Authentication

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/login` | تسجيل الدخول | — |
| POST | `/api/auth/register` | إنشاء حساب جديد | — |
| GET | `/api/auth/me` | بيانات المستخدم الحالي | JWT |

### لوحة التحكم / Dashboard

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/api/dashboard/summary` | ملخص النظام الحي | JWT |
| GET | `/api/dashboard/energy-today` | إنتاج الطاقة ساعة بساعة | JWT |
| GET | `/api/dashboard/alerts-summary` | إحصاء التنبيهات | JWT |

### قراءات المستشعرات / Sensor Readings

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/api/readings` | آخر 100 قراءة | JWT |
| POST | `/api/readings` | إضافة قراءة يدوية | JWT (tech) |

### الأجهزة / Devices

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/api/devices` | قائمة الأجهزة مع الحالة | JWT |
| PATCH | `/api/devices/:id/toggle` | تشغيل / إيقاف جهاز | JWT |

### استهلاك الأجهزة (IoT) / Device Consumption

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| POST | `/api/device-consumption` | إرسال قراءة IoT | X-IoT-Key أو JWT |
| POST | `/api/device-consumption/batch` | إرسال دفعي | X-IoT-Key أو JWT |
| GET | `/api/device-consumption/summary` | ملخص الاستهلاك لكل جهاز | JWT |
| GET | `/api/device-consumption/history` | سجل القراءات التاريخي | JWT |

### التنبيهات / Alerts

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| GET | `/api/alerts` | جميع التنبيهات (نشطة + محلولة) | JWT |
| PATCH | `/api/alerts/:id/resolve` | حل تنبيه | JWT (tech) |

### المساعد الذكي / AI Assistant

| Method | Endpoint | الوصف | Auth |
|--------|----------|-------|------|
| POST | `/api/gemini/conversations` | بدء محادثة جديدة | JWT |
| POST | `/api/gemini/conversations/:id/messages` | إرسال رسالة (SSE stream) | JWT |
| GET | `/api/gemini/conversations` | قائمة المحادثات | JWT |
| GET | `/api/gemini/conversations/:id` | تفاصيل محادثة مع رسائلها | JWT |
| DELETE | `/api/gemini/conversations/:id` | حذف محادثة | JWT |

---

## 7. مخطط قاعدة البيانات / Database Schema

```sql
-- ── المنظومات الشمسية ──────────────────────────────────
CREATE TABLE solar_systems (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  location    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── المستخدمون ─────────────────────────────────────────
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'client',  -- 'client' | 'technician'
  solar_system_id INTEGER REFERENCES solar_systems(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── قراءات المستشعرات (كل 5 دقائق مثلاً) ──────────────
CREATE TABLE sensor_readings (
  id               SERIAL PRIMARY KEY,
  solar_system_id  INTEGER REFERENCES solar_systems(id),
  voltage          REAL NOT NULL,       -- V  (DC string voltage)
  current          REAL NOT NULL,       -- A  (DC current)
  power            REAL NOT NULL,       -- W  (PV production)
  battery_level    REAL NOT NULL,       -- %  (State of Charge)
  battery_voltage  REAL NOT NULL,       -- V  (battery bank voltage)
  temperature      REAL NOT NULL,       -- °C (inverter/ambient)
  irradiance       REAL NOT NULL,       -- W/m² (solar irradiance)
  load_power       REAL NOT NULL,       -- W  (total consumption)
  system_status    TEXT DEFAULT 'normal', -- 'normal'|'warning'|'fault'|'offline'
  timestamp        TIMESTAMPTZ DEFAULT now()
);

-- ── التنبيهات ──────────────────────────────────────────
CREATE TABLE alerts (
  id               SERIAL PRIMARY KEY,
  solar_system_id  INTEGER REFERENCES solar_systems(id),
  type             TEXT NOT NULL,    -- 'battery_low'|'high_temp'|'inverter_fault'|...
  severity         TEXT NOT NULL,    -- 'critical' | 'warning' | 'info'
  message          TEXT NOT NULL,
  status           TEXT DEFAULT 'active',  -- 'active' | 'resolved'
  timestamp        TIMESTAMPTZ DEFAULT now(),
  resolved_at      TIMESTAMPTZ
);

-- ── الأجهزة الكهربائية ──────────────────────────────────
CREATE TABLE devices (
  id               SERIAL PRIMARY KEY,
  solar_system_id  INTEGER REFERENCES solar_systems(id),
  name             TEXT NOT NULL,
  type             TEXT NOT NULL,    -- 'ac'|'lighting'|'pump'|'inverter'|'heater'|...
  status           TEXT DEFAULT 'on', -- 'on'|'off'|'fault'|'standby'
  is_enabled       BOOLEAN DEFAULT TRUE,
  power_rating     REAL NOT NULL,    -- W (rated/nameplate power)
  location         TEXT NOT NULL
);

-- ── استهلاك الأجهزة IoT (الوقت الحقيقي) ────────────────
CREATE TABLE device_consumption (
  id                        SERIAL PRIMARY KEY,
  solar_system_id           INTEGER REFERENCES solar_systems(id) NOT NULL,
  device_name               TEXT NOT NULL,
  current_consumption_watts REAL DEFAULT 0,  -- W  (instantaneous)
  total_kwh                 REAL DEFAULT 0,  -- kWh (cumulative)
  timestamp                 TIMESTAMPTZ DEFAULT now()
);

-- ── محادثات AI ─────────────────────────────────────────
CREATE TABLE conversations (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  role            TEXT NOT NULL,  -- 'user' | 'assistant'
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. نظام المصادقة / Authentication Flow

```
Client App                    API Server                   Database
    │                              │                            │
    │  POST /api/auth/login         │                            │
    │  { email, password }          │                            │
    │─────────────────────────────▶│                            │
    │                              │  SELECT user WHERE email   │
    │                              │───────────────────────────▶│
    │                              │◀───────────────────────────│
    │                              │  bcrypt.compare(password)  │
    │                              │  JWT.sign({                │
    │                              │    userId, role,           │
    │                              │    solarSystemId           │
    │                              │  }, expires: 7d)           │
    │◀─────────────────────────────│                            │
    │  { token, user }             │                            │
    │                              │                            │
    │  GET /api/dashboard/summary  │                            │
    │  Authorization: Bearer <tok> │                            │
    │─────────────────────────────▶│                            │
    │                              │  JWT.verify(token)         │
    │                              │  → extract solarSystemId   │
    │                              │  Query ONLY this system    │
    │                              │───────────────────────────▶│
    │◀─────────────────────────────│◀───────────────────────────│
    │  { currentPower, battery…}   │                            │
```

**صلاحيات الدور / Role Permissions:**

| الإجراء | client | technician |
|---------|--------|------------|
| مشاهدة بيانات منظومته فقط | ✅ | ✅ |
| مشاهدة جميع المنظومات | ❌ | ✅ |
| إضافة قراءات يدوية | ❌ | ✅ |
| حل التنبيهات | ❌ | ✅ |
| التحكم بالأجهزة (تشغيل/إيقاف) | ✅ | ✅ |
| استخدام المساعد الذكي | ✅ | ✅ |
| إرسال بيانات IoT | ✅* | ✅ |

*عبر X-IoT-Key أو JWT

---

## 9. تكامل MQTT / MQTT Integration (Advanced)

للمنظومات الكبيرة التي تستخدم MQTT broker (Mosquitto / HiveMQ / AWS IoT Core):

```python
#!/usr/bin/env python3
"""
MQTT → SyncSolar Bridge
يستقبل من MQTT ويعيد نشره إلى SyncSolar REST API
"""
import json, requests
import paho.mqtt.client as mqtt

MQTT_BROKER   = "192.168.1.100"    # عنوان broker
MQTT_PORT     = 1883
MQTT_TOPIC    = "solar/+/readings" # + = wildcard لمعرف النظام

SYNCSOLAR_API = "https://YOUR_DOMAIN/api/device-consumption"
IOT_KEY       = "syncsolar-iot-dev-key"

def on_message(client, userdata, msg):
    try:
        # Topic: solar/{SYSTEM_ID}/readings
        system_id = int(msg.topic.split("/")[1])
        data      = json.loads(msg.payload)

        r = requests.post(SYNCSOLAR_API,
            json={
                "solarSystemId":           system_id,
                "deviceName":              data.get("device", "MQTT Device"),
                "currentConsumptionWatts": data.get("watts", 0),
                "totalKwh":                data.get("kwh", 0),
            },
            headers={"X-IoT-Key": IOT_KEY},
            timeout=5)
        print(f"{'✅' if r.status_code==201 else '❌'} {msg.topic} → {r.status_code}")
    except Exception as e:
        print(f"❌ Bridge error: {e}")

client = mqtt.Client()
client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT)
client.subscribe(MQTT_TOPIC)
print("🔄 MQTT Bridge active")
client.loop_forever()
```

**هيكل MQTT Topics:**
```
solar/{system_id}/readings   →  قراءات المستشعرات
solar/{system_id}/alerts     →  تنبيهات الأجهزة
solar/{system_id}/control    →  أوامر التحكم
solar/{system_id}/status     →  حالة الجهاز
```

---

## 10. المساعد الذكي / AI Assistant Deep Dive

المساعد مدرَّب تخصصياً ويُحقن ببيانات النظام الحية عند كل سؤال:

```
المستخدم يسأل: "ما هو مستوى البطارية الآن؟"
         ↓
API يستقبل الطلب + JWT
         ↓
buildLiveContext(systemId) يجمع:
  ① آخر قراءة مستشعر (V, A, W, SoC%, T°C, Irr)
  ② التنبيهات النشطة مع الخطورة
  ③ قائمة الأجهزة مع الحالة الحالية
  ④ آخر قراءات استهلاك IoT لكل جهاز
         ↓
يُضاف السياق الحي إلى نظام الـ prompt
         ↓
Gemini 2.5 Flash يولّد رداً بناءً على:
  • مستوى البطارية الفعلي من DB
  • أي تنبيهات نشطة ذات صلة
  • خبرته في هندسة الطاقة الشمسية
         ↓
SSE stream → تطبيق الموبايل
```

**قدرات المساعد / Assistant Capabilities:**
- تشخيص الأعطال برموز الخطأ الكاملة (F001–F050)
- تحليل أداء المنظومة (PR، حصيلة نوعية، CUF)
- حساب أحجام الأوتار والكابلات والحمايات
- تفسير منحنيات I-V ومؤشرات الأداء
- جداول صيانة وقائية مفصّلة
- دعم كامل للغتين العربية والإنجليزية

---

## 11. الأمان / Security Architecture

| الطبقة | الحماية |
|--------|---------|
| النقل (Transport) | TLS 1.3 — جميع البيانات مشفّرة |
| مصادقة API | JWT (HS256، صلاحية 7 أيام) |
| مصادقة IoT | X-IoT-Key header (مشترك سري) |
| عزل البيانات | كل مستخدم يرى بيانات منظومته فقط |
| كلمات المرور | bcrypt (12 rounds) — غير قابلة للقراءة |

**متغيرات البيئة للإنتاج / Production Env Vars:**
```bash
IOT_API_KEY=your-secret-32-char-minimum-key
JWT_SECRET=your-256-bit-random-secret
DATABASE_URL=postgresql://user:pass@host:5432/syncsolar
```

---

## 12. قيم حدود التشغيل / Normal Operating Thresholds

| المعيار | Metric | الحد الأدنى | الطبيعي | الحد الأقصى | تنبيه عند |
|---------|--------|-------------|---------|-------------|-----------|
| جهد الألواح (DC) | Panel Voltage | 200 V | 350–550 V | 1000 V | < 150 V أو > 900 V |
| مستوى البطارية | Battery SoC | 0% | 40–90% | 100% | < 20% |
| درجة حرارة العاكس | Inverter Temp | — | 30–55°C | 75°C | > 65°C |
| درجة حرارة البطارية | Battery Temp | 5°C | 15–35°C | 45°C | > 40°C أو < 5°C |
| الإشعاع الشمسي | Irradiance | 0 | 400–900 W/m² | 1100 W/m² | انخفاض مفاجئ |
| نسبة الأداء | Performance Ratio | — | 75–85% | 100% | < 70% |
| مقاومة العزل | Riso | — | > 1 MΩ | — | < 200 kΩ → إيقاف فوري |

---

## 13. خطوات التشغيل الأولي / Quick Start Checklist

```
□ 1. تحقق من الـ API: GET https://YOUR_DOMAIN/api/health
□ 2. سجّل دخول تقني:  POST /api/auth/login  (tech@syncsolar.com)
□ 3. اختبر IoT:       POST /api/device-consumption  + X-IoT-Key
□ 4. برمج ESP32/RPi لإرسال قراءات كل 30 ثانية
□ 5. افتح تطبيق الموبايل → تبويب Devices → راقب الاستهلاك الحي
□ 6. اختبر المساعد:  "ما هو وضع النظام الآن؟" / "What is my battery level?"
□ 7. للإنتاج:        غيّر IOT_API_KEY و JWT_SECRET في متغيرات البيئة
□ 8. اضبط جدول الصيانة وفق الجدول في القسم 12
```

---

*SyncSolar Systems — منصة مراقبة الطاقة الشمسية الذكية*  
*Smart Solar Energy Monitoring Platform — v2.0*
