import {
  Wifi,
  Cpu,
  Zap,
  Battery,
  Thermometer,
  Globe,
  Shield,
  Radio,
  Server,
  Settings,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Info,
  Layers,
  Cable,
  Activity,
  Network,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const isAr = (lang: string) => lang === "ar";

function SectionTitle({ ar, en, icon, lang }: { ar: string; en: string; icon: React.ReactNode; lang: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(255,140,26,0.15)", color: "#ff8c1a" }}
      >
        {icon}
      </div>
      <h2 className="text-xl font-bold" style={{ color: "#eeeee8" }}>
        {isAr(lang) ? ar : en}
      </h2>
    </div>
  );
}

function DeviceCard({
  icon,
  titleAr,
  titleEn,
  descAr,
  descEn,
  protocols,
  badge,
  badgeColor,
  lang,
}: {
  icon: React.ReactNode;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  protocols: string[];
  badge: string;
  badgeColor: string;
  lang: string;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ background: "#0d1326", borderColor: "#202940" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: badgeColor + "22", color: badgeColor }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: "#eeeee8" }}>
              {isAr(lang) ? titleAr : titleEn}
            </h3>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: badgeColor + "18", color: badgeColor }}
            >
              {badge}
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "#758ab0" }}>
        {isAr(lang) ? descAr : descEn}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {protocols.map((p) => (
          <span
            key={p}
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: "rgba(0,200,216,0.1)", color: "#00c8d8", border: "1px solid rgba(0,200,216,0.2)" }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProtocolCard({
  icon,
  name,
  descAr,
  descEn,
  useCase,
  useCaseEn,
  color,
  lang,
}: {
  icon: React.ReactNode;
  name: string;
  descAr: string;
  descEn: string;
  useCase: string;
  useCaseEn: string;
  color: string;
  lang: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 flex gap-4"
      style={{ background: "#0d1326", borderColor: "#202940" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: color + "22", color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-bold font-mono text-sm" style={{ color: "#eeeee8" }}>{name}</span>
        </div>
        <p className="text-sm leading-relaxed mb-2" style={{ color: "#758ab0" }}>
          {isAr(lang) ? descAr : descEn}
        </p>
        <div
          className="text-xs px-2 py-1 rounded flex items-center gap-1.5"
          style={{ background: "rgba(255,140,26,0.06)", borderLeft: `2px solid #ff8c1a` }}
        >
          <ArrowRight className="h-3 w-3 shrink-0" style={{ color: "#ff8c1a" }} />
          <span style={{ color: "#b8925a" }}>{isAr(lang) ? useCase : useCaseEn}</span>
        </div>
      </div>
    </div>
  );
}

function Step({
  num,
  titleAr,
  titleEn,
  items,
  itemsEn,
  lang,
}: {
  num: number;
  titleAr: string;
  titleEn: string;
  items: string[];
  itemsEn: string[];
  lang: string;
}) {
  const list = isAr(lang) ? items : itemsEn;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: "linear-gradient(135deg, #ff8c1a, #ff6b00)", color: "#090e1a" }}
        >
          {num}
        </div>
        {num < 5 && <div className="w-0.5 flex-1 mt-2" style={{ background: "#202940" }} />}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <h4 className="font-bold mb-2" style={{ color: "#eeeee8" }}>
          {isAr(lang) ? titleAr : titleEn}
        </h4>
        <ul className="space-y-1.5">
          {list.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#758ab0" }}>
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ConfigBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#202940" }}>
      <div
        className="px-4 py-2 text-xs font-mono font-semibold"
        style={{ background: "#131b2e", color: "#758ab0", borderBottom: "1px solid #202940" }}
      >
        {label}
      </div>
      <pre
        className="p-4 text-xs font-mono leading-relaxed overflow-x-auto"
        style={{ background: "#090e1a", color: "#00c8d8" }}
      >
        {code}
      </pre>
    </div>
  );
}

export default function IoTGuidePage() {
  const { lang } = useLanguage();
  const ar = isAr(lang);

  return (
    <div
      className="max-w-4xl mx-auto space-y-10"
      dir={ar ? "rtl" : "ltr"}
      style={{ color: "#eeeee8" }}
    >
      {/* ── Hero ── */}
      <div
        className="rounded-2xl border p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d1326 0%, #0a1020 100%)", borderColor: "#202940" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,140,26,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #ff8c1a22, #ff8c1a11)", border: "1px solid rgba(255,140,26,0.3)" }}
          >
            <Wifi className="h-8 w-8" style={{ color: "#ff8c1a" }} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#eeeee8" }}>
              {ar ? "دليل ربط أجهزة IoT بالطاقة الشمسية" : "IoT Device Integration Guide"}
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "#758ab0" }}>
              {ar
                ? "تعلّم كيفية ربط أنظمة الطاقة الشمسية المختلفة بمنصة Sync Solar System لمراقبة وتحكم كاملَين في الوقت الحقيقي"
                : "Learn how to connect various solar energy systems to Sync Solar System for full real-time monitoring and control"}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Modbus TCP", "MQTT", "RS-485", "HTTP API", "LoRa"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,200,216,0.1)", color: "#00c8d8", border: "1px solid rgba(0,200,216,0.2)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Banner ── */}
      <div
        className="rounded-xl border p-4 flex items-start gap-3"
        style={{ background: "rgba(0,200,216,0.05)", borderColor: "rgba(0,200,216,0.2)" }}
      >
        <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#00c8d8" }} />
        <p className="text-sm leading-relaxed" style={{ color: "#758ab0" }}>
          {ar
            ? "يعمل Sync Solar System كطبقة برمجية فوق طبقة الأجهزة — تتلقى البيانات من بوابات IoT وتحوّلها إلى معلومات مرئية قابلة للتحليل والتحكم. الأجهزة لا تتصل مباشرةً بالمنصة بل عبر وسيط (Gateway/Broker)."
            : "Sync Solar System acts as a software layer above the hardware layer — receiving data from IoT gateways and converting it into visual, analyzable, and controllable information. Devices do not connect directly to the platform but through an intermediary (Gateway/Broker)."}
        </p>
      </div>

      {/* ── Section 1: Supported Devices ── */}
      <section>
        <SectionTitle
          ar="أنواع الأجهزة المدعومة"
          en="Supported Device Types"
          icon={<Cpu className="h-5 w-5" />}
          lang={lang}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DeviceCard
            icon={<Zap className="h-5 w-5" />}
            titleAr="العاكسون (Inverters)"
            titleEn="Inverters"
            descAr="يحوّل العاكس التيار المستمر القادم من الألواح الشمسية إلى تيار متردد يمكن استخدامه في المنازل والمصانع. يُعدّ أهم جهاز في المنظومة."
            descEn="Converts DC from solar panels to AC used in homes and factories. The most critical device in the system."
            protocols={["Modbus TCP", "Modbus RTU", "SunSpec", "RS-485"]}
            badge="CRITICAL"
            badgeColor="#ff8c1a"
            lang={lang}
          />
          <DeviceCard
            icon={<Battery className="h-5 w-5" />}
            titleAr="وحدات التحكم في الشحن"
            titleEn="Charge Controllers"
            descAr="تنظّم شحن البطاريات وتحمي المنظومة من الشحن الزائد والتفريغ العميق. تدعم أنواع MPPT وPWM."
            descEn="Regulate battery charging and protect the system from overcharge and deep discharge. Supports MPPT and PWM types."
            protocols={["Modbus RTU", "RS-485", "CAN Bus"]}
            badge="MPPT / PWM"
            badgeColor="#22c55e"
            lang={lang}
          />
          <DeviceCard
            icon={<Activity className="h-5 w-5" />}
            titleAr="عدادات الطاقة الذكية"
            titleEn="Smart Energy Meters"
            descAr="تقيس استهلاك الطاقة بدقة عالية وتُرسل البيانات بشكل مستمر. تُستخدم لحساب الوفورات ومراقبة الأحمال."
            descEn="Measure energy consumption with high accuracy and send data continuously. Used to calculate savings and monitor loads."
            protocols={["Modbus TCP", "M-Bus", "DLMS/COSEM", "HTTP"]}
            badge="METERING"
            badgeColor="#a855f7"
            lang={lang}
          />
          <DeviceCard
            icon={<Thermometer className="h-5 w-5" />}
            titleAr="أجهزة الاستشعار البيئية"
            titleEn="Environmental Sensors"
            descAr="تقيس درجة الحرارة، الإشعاع الشمسي، رطوبة الهواء، وسرعة الرياح. بيانات أساسية لتحليل كفاءة الألواح."
            descEn="Measure temperature, solar irradiance, humidity, and wind speed. Essential data for panel efficiency analysis."
            protocols={["MQTT", "I2C", "1-Wire", "LoRa", "Zigbee"]}
            badge="SENSING"
            badgeColor="#00c8d8"
            lang={lang}
          />
          <DeviceCard
            icon={<Layers className="h-5 w-5" />}
            titleAr="وحدات التحكم في الأحمال"
            titleEn="Load Controllers / Relays"
            descAr="تُتيح تشغيل/إيقاف الأحمال (مضخات، سخانات، أجهزة تكييف) عن بُعد بناءً على مستوى البطارية أو جدول زمني."
            descEn="Allow remote on/off control of loads (pumps, heaters, ACs) based on battery level or schedule."
            protocols={["Modbus", "MQTT", "HTTP REST", "Zigbee"]}
            badge="CONTROL"
            badgeColor="#f59e0b"
            lang={lang}
          />
          <DeviceCard
            icon={<Network className="h-5 w-5" />}
            titleAr="بوابات IoT (Gateways)"
            titleEn="IoT Gateways"
            descAr="الحلقة الرابطة بين أجهزة الطاقة الشمسية والسحابة. تجمع البيانات من بروتوكولات متعددة وتُرسلها للمنصة."
            descEn="The link between solar devices and the cloud. Collect data from multiple protocols and send it to the platform."
            protocols={["RS-485→MQTT", "Modbus→HTTP", "OPC-UA", "4G/LTE"]}
            badge="GATEWAY"
            badgeColor="#ff8c1a"
            lang={lang}
          />
        </div>
      </section>

      {/* ── Section 2: Communication Protocols ── */}
      <section>
        <SectionTitle
          ar="بروتوكولات الاتصال المدعومة"
          en="Supported Communication Protocols"
          icon={<Cable className="h-5 w-5" />}
          lang={lang}
        />
        <div className="space-y-3">
          <ProtocolCard
            icon={<Radio className="h-4 w-4" />}
            name="Modbus RTU / TCP"
            descAr="البروتوكول الصناعي الأكثر انتشاراً في العالم. يدعم الاتصال عبر RS-485 (RTU) أو الإيثرنت (TCP). معظم العاكسين ووحدات الشحن تدعمه."
            descEn="The world's most widely used industrial protocol. Supports RS-485 (RTU) or Ethernet (TCP). Most inverters and charge controllers support it."
            useCase="يُستخدم مع: SMA, Huawei, Growatt, Victron, Fronius"
            useCaseEn="Used with: SMA, Huawei, Growatt, Victron, Fronius"
            color="#ff8c1a"
            lang={lang}
          />
          <ProtocolCard
            icon={<Wifi className="h-4 w-4" />}
            name="MQTT"
            descAr="بروتوكول خفيف الوزن مصمّم للأجهزة ذات الموارد المحدودة. يعمل على نموذج Publisher/Subscriber مع وسيط (Broker) مثل Mosquitto أو HiveMQ."
            descEn="Lightweight protocol designed for resource-constrained devices. Works on Publisher/Subscriber model with a Broker like Mosquitto or HiveMQ."
            useCase="يُستخدم مع: أجهزة ESP32/Arduino، مستشعرات LoRa، أنظمة Home Assistant"
            useCaseEn="Used with: ESP32/Arduino devices, LoRa sensors, Home Assistant systems"
            color="#22c55e"
            lang={lang}
          />
          <ProtocolCard
            icon={<Globe className="h-4 w-4" />}
            name="HTTP / REST API"
            descAr="بروتوكول الويب القياسي. الأجهزة الذكية الحديثة تُوفّر واجهة REST API يمكن استطلاعها بشكل دوري أو عبر Webhooks."
            descEn="Standard web protocol. Modern smart devices provide a REST API that can be polled periodically or via Webhooks."
            useCase="يُستخدم مع: Enphase، SolarEdge، عدادات الطاقة الذكية"
            useCaseEn="Used with: Enphase, SolarEdge, smart energy meters"
            color="#00c8d8"
            lang={lang}
          />
          <ProtocolCard
            icon={<Radio className="h-4 w-4" />}
            name="LoRa / LoRaWAN"
            descAr="بروتوكول لاسلكي طويل المدى (حتى 15 كم) منخفض الطاقة. مثالي للمنظومات الريفية البعيدة عن شبكة الإنترنت."
            descEn="Long-range (up to 15km) low-power wireless protocol. Ideal for rural systems far from internet networks."
            useCase="يُستخدم في: المزارع الشمسية الكبيرة، المناطق النائية، أنظمة الضخ الزراعي"
            useCaseEn="Used in: large solar farms, remote areas, agricultural pumping systems"
            color="#a855f7"
            lang={lang}
          />
          <ProtocolCard
            icon={<Server className="h-4 w-4" />}
            name="OPC-UA"
            descAr="بروتوكول صناعي متقدم يدعم نمذجة البيانات المعقدة والتحكم ثنائي الاتجاه. شائع في المصانع والمحطات الكبيرة."
            descEn="Advanced industrial protocol supporting complex data modeling and bidirectional control. Common in factories and large plants."
            useCase="يُستخدم في: محطات الطاقة الشمسية الكبيرة، الأنظمة الصناعية المتكاملة"
            useCaseEn="Used in: large solar power plants, integrated industrial systems"
            color="#f59e0b"
            lang={lang}
          />
        </div>
      </section>

      {/* ── Section 3: Connection Architecture ── */}
      <section>
        <SectionTitle
          ar="معمارية الربط الموصى بها"
          en="Recommended Connection Architecture"
          icon={<Layers className="h-5 w-5" />}
          lang={lang}
        />
        <div
          className="rounded-xl border p-6"
          style={{ background: "#0d1326", borderColor: "#202940" }}
        >
          <div className="flex flex-col items-center gap-3 text-sm">
            {[
              { labelAr: "الألواح الشمسية / البطاريات / المحركات", labelEn: "Solar Panels / Batteries / Motors", icon: <Zap className="h-4 w-4" />, color: "#ff8c1a" },
              { labelAr: "العاكس / وحدة التحكم / العداد الذكي", labelEn: "Inverter / Controller / Smart Meter", icon: <Cpu className="h-4 w-4" />, color: "#22c55e" },
              { labelAr: "بوابة IoT (RS-485 → Ethernet / 4G)", labelEn: "IoT Gateway (RS-485 → Ethernet / 4G)", icon: <Network className="h-4 w-4" />, color: "#00c8d8" },
              { labelAr: "وسيط MQTT / Modbus TCP Bridge", labelEn: "MQTT Broker / Modbus TCP Bridge", icon: <Radio className="h-4 w-4" />, color: "#a855f7" },
              { labelAr: "خادم API — Sync Solar System", labelEn: "API Server — Sync Solar System", icon: <Server className="h-4 w-4" />, color: "#ff8c1a" },
              { labelAr: "لوحة التحكم (ويب) + التطبيق (جوّال)", labelEn: "Dashboard (Web) + App (Mobile)", icon: <Globe className="h-4 w-4" />, color: "#00c8d8" },
            ].map((item, i, arr) => (
              <div key={i} className="w-full flex flex-col items-center">
                <div
                  className="w-full max-w-sm rounded-lg px-4 py-2.5 flex items-center gap-3 font-medium text-center justify-center"
                  style={{ background: item.color + "14", border: `1px solid ${item.color}33`, color: item.color }}
                >
                  {item.icon}
                  <span className="text-xs">{ar ? item.labelAr : item.labelEn}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-0.5 h-4" style={{ background: "#202940" }} />
                    <ArrowRight className="h-3 w-3 rotate-90" style={{ color: "#758ab0" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Step-by-Step ── */}
      <section>
        <SectionTitle
          ar="خطوات الربط التفصيلية"
          en="Detailed Connection Steps"
          icon={<Settings className="h-5 w-5" />}
          lang={lang}
        />
        <div className="space-y-0">
          <Step
            num={1}
            titleAr="اختيار بوابة IoT المناسبة"
            titleEn="Choose the Right IoT Gateway"
            items={[
              "حدّد نوع البروتوكول الذي يدعمه الجهاز (Modbus RS-485، TCP، MQTT)",
              "اختر بوابة تدعم التحويل بين بروتوكول الجهاز وبروتوكول الشبكة",
              "أمثلة موصى بها: USR-W630، WaveShare RS485-to-WiFi، Waveshare 4G DTU",
              "تأكّد من دعم الجهاز لعناوين Modbus الصحيحة الخاصة بعلامتك التجارية",
            ]}
            itemsEn={[
              "Identify the protocol your device supports (Modbus RS-485, TCP, MQTT)",
              "Choose a gateway that supports conversion between device protocol and network protocol",
              "Recommended examples: USR-W630, WaveShare RS485-to-WiFi, Waveshare 4G DTU",
              "Ensure the gateway supports the correct Modbus addresses for your brand",
            ]}
            lang={lang}
          />
          <Step
            num={2}
            titleAr="إعداد الاتصال الفيزيائي"
            titleEn="Set Up Physical Connection"
            items={[
              "ربط A+ و B- من العاكس/وحدة الشحن بمنفذ RS-485 في البوابة",
              "استخدم كابل شيلدد twisted pair مع أرضي مشترك لتجنّب التداخل",
              "إذا كان الجهاز يدعم RJ45: استخدام كابل Ethernet مباشرة للشبكة",
              "وصّل البوابة بالإنترنت (LAN، WiFi، أو SIM 4G)",
            ]}
            itemsEn={[
              "Connect A+ and B- from inverter/charge controller to the RS-485 port of the gateway",
              "Use shielded twisted pair cable with common ground to avoid interference",
              "If device supports RJ45: use Ethernet cable directly to network",
              "Connect the gateway to the internet (LAN, WiFi, or 4G SIM)",
            ]}
            lang={lang}
          />
          <Step
            num={3}
            titleAr="تكوين بروتوكول الاتصال"
            titleEn="Configure Communication Protocol"
            items={[
              "ادخل لصفحة إعدادات البوابة (عادةً عبر IP: 192.168.1.1)",
              "عيّن معدل البث (Baud Rate): 9600 أو 19200 أو 115200 حسب الجهاز",
              "حدّد Modbus Device ID (عادةً 1 أو 2) أو عنوان MQTT Topic",
              "اختبر الاتصال باستخدام Modbus Poll أو MQTT Explorer",
            ]}
            itemsEn={[
              "Access the gateway settings page (usually via IP: 192.168.1.1)",
              "Set the Baud Rate: 9600, 19200, or 115200 depending on the device",
              "Define Modbus Device ID (usually 1 or 2) or MQTT Topic address",
              "Test connection using Modbus Poll or MQTT Explorer",
            ]}
            lang={lang}
          />
          <Step
            num={4}
            titleAr="إعداد وسيط MQTT أو خادم Modbus TCP"
            titleEn="Set Up MQTT Broker or Modbus TCP Server"
            items={[
              "تثبيت Mosquitto Broker على خادم لينكس: sudo apt install mosquitto",
              "أو استخدام خدمة سحابية: HiveMQ Cloud، EMQX Cloud (مجانية للاستخدام الشخصي)",
              "لـ Modbus TCP: تكوين البوابة للاستماع على port 502",
              "أضف قاعدة جدار الحماية للسماح بالـ Port المستخدم",
            ]}
            itemsEn={[
              "Install Mosquitto Broker on a Linux server: sudo apt install mosquitto",
              "Or use a cloud service: HiveMQ Cloud, EMQX Cloud (free for personal use)",
              "For Modbus TCP: configure gateway to listen on port 502",
              "Add firewall rule to allow the used port",
            ]}
            lang={lang}
          />
          <Step
            num={5}
            titleAr="تكوين الجهاز في Sync Solar System"
            titleEn="Configure Device in Sync Solar System"
            items={[
              "اذهب إلى صفحة 'الأجهزة' واضغط زر إضافة جهاز جديد",
              "أدخل نوع الجهاز، الموقع، IP الخادم، ورقم منفذ Modbus ID",
              "اضبط فترة القراءة التلقائية (موصى به: كل 5 ثوانٍ لبيانات حرجة)",
              "فعّل الجهاز وراقب قراءاته في لوحة المراقبة مباشرةً",
            ]}
            itemsEn={[
              "Go to the 'Devices' page and click 'Add New Device'",
              "Enter device type, location, server IP, and Modbus ID port number",
              "Set auto-read interval (recommended: every 5 seconds for critical data)",
              "Activate the device and monitor its readings in the monitoring dashboard",
            ]}
            lang={lang}
          />
        </div>
      </section>

      {/* ── Section 5: Config Examples ── */}
      <section>
        <SectionTitle
          ar="أمثلة على إعدادات التكوين"
          en="Configuration Examples"
          icon={<Server className="h-5 w-5" />}
          lang={lang}
        />
        <div className="space-y-4">
          <ConfigBlock
            label={ar ? "مثال: قراءة بيانات عاكس Huawei SUN2000 عبر Modbus TCP" : "Example: Reading Huawei SUN2000 inverter via Modbus TCP"}
            code={`# Python — pymodbus
from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient(host="192.168.1.100", port=502)
client.connect()

# Register 32064: Active Power (حالة الطاقة الفعلية)
result = client.read_holding_registers(
    address=32064,
    count=2,
    slave=1          # Modbus Device ID
)
watts = result.registers[0] * 10  # مضروب في 10 للحصول على W
print(f"Active Power: {watts} W")`}
          />
          <ConfigBlock
            label={ar ? "مثال: نشر بيانات مستشعر عبر MQTT (ESP32)" : "Example: Publishing sensor data via MQTT (ESP32)"}
            code={`// Arduino / ESP32 — PubSubClient
#include <PubSubClient.h>
WiFiClient espClient;
PubSubClient mqtt(espClient);

mqtt.setServer("your-broker.com", 1883);
mqtt.connect("solar-sensor-01", "user", "pass");

// نشر قراءة الإشعاع الشمسي كل 10 ثوانٍ
String payload = "{\\"irradiance\\":" + String(irr) + 
                 ",\\"temp\\":" + String(temp) + "}";
mqtt.publish("syncsolar/system/1/sensors", payload.c_str());`}
          />
          <ConfigBlock
            label={ar ? "مثال: استطلاع API عاكس SolarEdge" : "Example: Polling SolarEdge inverter API"}
            code={`# SolarEdge REST API — Python
import requests

API_KEY  = "YOUR_SOLAREDGE_API_KEY"
SITE_ID  = "YOUR_SITE_ID"
BASE_URL = "https://monitoringapi.solaredge.com"

# الطاقة الحالية
r = requests.get(
    f"{BASE_URL}/site/{SITE_ID}/currentPowerFlow",
    params={"api_key": API_KEY}
)
data = r.json()
grid_power = data["siteCurrentPowerFlow"]["GRID"]["currentPower"]
print(f"Grid Power: {grid_power} kW")`}
          />
        </div>
      </section>

      {/* ── Section 6: Compatible Devices ── */}
      <section>
        <SectionTitle
          ar="أجهزة مختبَرة ومتوافقة"
          en="Tested & Compatible Devices"
          icon={<CheckCircle2 className="h-5 w-5" />}
          lang={lang}
        />
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "#202940" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#131b2e" }}>
                {[
                  { ar: "الجهاز", en: "Device" },
                  { ar: "النوع", en: "Type" },
                  { ar: "البروتوكول", en: "Protocol" },
                  { ar: "الحالة", en: "Status" },
                ].map((col) => (
                  <th
                    key={col.en}
                    className="text-start px-4 py-3 font-semibold"
                    style={{ color: "#758ab0" }}
                  >
                    {ar ? col.ar : col.en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Huawei SUN2000", type: ar ? "عاكس" : "Inverter", protocol: "Modbus TCP", status: "✓", color: "#22c55e" },
                { name: "Growatt SPH", type: ar ? "عاكس هجين" : "Hybrid Inverter", protocol: "Modbus RTU", status: "✓", color: "#22c55e" },
                { name: "SMA Sunny Boy", type: ar ? "عاكس" : "Inverter", protocol: "Modbus TCP", status: "✓", color: "#22c55e" },
                { name: "Victron SmartSolar", type: ar ? "وحدة شحن" : "Charge Ctrl", protocol: "VE.Direct / Modbus", status: "✓", color: "#22c55e" },
                { name: "Fronius Symo", type: ar ? "عاكس" : "Inverter", protocol: "Modbus TCP / REST", status: "✓", color: "#22c55e" },
                { name: "SolarEdge SE", type: ar ? "عاكس" : "Inverter", protocol: "REST API", status: "✓", color: "#22c55e" },
                { name: "Eastron SDM630", type: ar ? "عداد طاقة" : "Energy Meter", protocol: "Modbus RTU", status: "✓", color: "#22c55e" },
                { name: "ESP32 + BME280", type: ar ? "مستشعر بيئي" : "Env. Sensor", protocol: "MQTT", status: "✓", color: "#22c55e" },
                { name: "Shelly Pro 3EM", type: ar ? "عداد طاقة" : "Energy Meter", protocol: "HTTP / MQTT", status: "✓", color: "#22c55e" },
                { name: "Pylontech US5000", type: ar ? "بطارية BESS" : "Battery BESS", protocol: "CAN Bus / RS-485", status: ar ? "قيد الاختبار" : "Beta", color: "#f59e0b" },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-t"
                  style={{ borderColor: "#1a2236", background: i % 2 === 0 ? "transparent" : "#0a1020" }}
                >
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: "#eeeee8" }}>{row.name}</td>
                  <td className="px-4 py-3" style={{ color: "#758ab0" }}>{row.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ background: "rgba(0,200,216,0.1)", color: "#00c8d8" }}
                    >
                      {row.protocol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-xs" style={{ color: row.color }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 7: Best Practices ── */}
      <section>
        <SectionTitle
          ar="أفضل الممارسات والأمان"
          en="Best Practices & Security"
          icon={<Shield className="h-5 w-5" />}
          lang={lang}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: <Shield className="h-4 w-4" />,
              titleAr: "عزل شبكة الأجهزة",
              titleEn: "Isolate Device Network",
              descAr: "ضع أجهزة IoT في VLAN منفصل أو شبكة خاصة، ولا تعرّضها مباشرةً للإنترنت. استخدم VPN للوصول عن بُعد.",
              descEn: "Place IoT devices in a separate VLAN or private network, never expose them directly to the internet. Use VPN for remote access.",
              color: "#ff8c1a",
            },
            {
              icon: <Settings className="h-4 w-4" />,
              titleAr: "تحديث الثوابت دورياً",
              titleEn: "Update Firmware Regularly",
              descAr: "تحقّق من تحديثات firmware للعاكسين والبوابات كل 3 أشهر. التحديثات تُصلح ثغرات أمنية وتحسّن الأداء.",
              descEn: "Check for firmware updates for inverters and gateways every 3 months. Updates fix security vulnerabilities and improve performance.",
              color: "#22c55e",
            },
            {
              icon: <Activity className="h-4 w-4" />,
              titleAr: "مراقبة معدل الاتصال",
              titleEn: "Monitor Connection Rate",
              descAr: "راقب heartbeat الأجهزة. إذا انقطعت القراءات لأكثر من 5 دقائق، فعّل تنبيهاً تلقائياً لاكتشاف العطل مبكراً.",
              descEn: "Monitor device heartbeat. If readings stop for more than 5 minutes, trigger an automatic alert for early fault detection.",
              color: "#00c8d8",
            },
            {
              icon: <Radio className="h-4 w-4" />,
              titleAr: "إعداد وصلة بديلة",
              titleEn: "Set Up Failover Connection",
              descAr: "استخدم بوابة تدعم WiFi + 4G معاً. عند انقطاع الإنترنت، تنتقل تلقائياً للشبكة الخلوية مع احتفاظ البيانات محلياً.",
              descEn: "Use a gateway that supports both WiFi + 4G. On internet outage, it automatically switches to cellular while storing data locally.",
              color: "#a855f7",
            },
            {
              icon: <Server className="h-4 w-4" />,
              titleAr: "تخزين البيانات المحلي",
              titleEn: "Local Data Storage",
              descAr: "اختر بوابة تدعم ذاكرة محلية (SD card أو eMMC) لتخزين القراءات عند انقطاع الإنترنت ورفعها لاحقاً.",
              descEn: "Choose a gateway with local storage (SD card or eMMC) to store readings during internet outages and upload them later.",
              color: "#f59e0b",
            },
            {
              icon: <AlertTriangle className="h-4 w-4" />,
              titleAr: "اختبار منتظم للاتصال",
              titleEn: "Regular Connection Testing",
              descAr: "أجرِ اختباراً شهرياً لكل الأجهزة: افصل وأعد الاتصال، تحقّق من تسجيل البيانات، واختبر وظيفة التحكم عن بُعد.",
              descEn: "Perform monthly testing of all devices: disconnect and reconnect, verify data logging, and test remote control functionality.",
              color: "#f23030",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 flex gap-3"
              style={{ background: "#0d1326", borderColor: "#202940" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: item.color + "18", color: item.color }}
              >
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: "#eeeee8" }}>
                  {ar ? item.titleAr : item.titleEn}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: "#758ab0" }}>
                  {ar ? item.descAr : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <div
        className="rounded-2xl border p-6 text-center"
        style={{ background: "rgba(255,140,26,0.04)", borderColor: "rgba(255,140,26,0.2)" }}
      >
        <Wifi className="h-8 w-8 mx-auto mb-3" style={{ color: "#ff8c1a" }} />
        <h3 className="text-lg font-bold mb-2" style={{ color: "#eeeee8" }}>
          {ar ? "هل تحتاج مساعدة في الربط؟" : "Need help with integration?"}
        </h3>
        <p className="text-sm mb-4" style={{ color: "#758ab0" }}>
          {ar
            ? "يمكنك سؤال المساعد الذكي المدمج في المنصة — فهو مدرَّب على تفاصيل أنظمة الطاقة الشمسية وبروتوكولات IoT"
            : "You can ask the built-in AI Assistant — it's trained on solar system details and IoT protocols"}
        </p>
        <a
          href="/ai-assistant"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #ff8c1a, #ff6b00)", color: "#090e1a" }}
        >
          <Globe className="h-4 w-4" />
          {ar ? "افتح المساعد الذكي" : "Open AI Assistant"}
        </a>
      </div>
    </div>
  );
}
