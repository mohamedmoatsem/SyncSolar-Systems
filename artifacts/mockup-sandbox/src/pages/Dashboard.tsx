import { useState, useEffect } from "react";
import {
  Sun,
  Battery,
  Zap,
  Activity,
  Thermometer,
  Wind,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BarChart3,
  Globe,
  Moon,
} from "lucide-react";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useAnimatedValue(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

const C = {
  bg: "#090e1a",
  card: "#0d1326",
  border: "#202940",
  muted: "#191f30",
  primary: "#ff8c1a",
  secondary: "#00c8d8",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  fg: "#e8edf5",
  mutedFg: "#758ab0",
};

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  bar?: number;
}

function MetricCard({ label, value, unit, sub, icon, color, trend, trendValue, bar }: MetricCardProps) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.8 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ color: C.mutedFg, fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ background: `${color}18`, borderRadius: 8, padding: 6, color }}>{icon}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ color: C.fg, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ color: C.mutedFg, fontSize: 14 }}>{unit}</span>}
      </div>
      {bar !== undefined && (
        <div style={{ background: C.muted, borderRadius: 4, height: 5, overflow: "hidden" }}>
          <div style={{ width: `${bar}%`, height: "100%", background: color, borderRadius: 4, transition: "width 1.2s ease" }} />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {sub && <span style={{ color: C.mutedFg, fontSize: 12 }}>{sub}</span>}
        {trend && trendValue && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, color: trend === "up" ? C.green : trend === "down" ? C.red : C.mutedFg, fontSize: 12, fontWeight: 500 }}>
            {trend === "up" ? <TrendingUp size={13} /> : trend === "down" ? <TrendingDown size={13} /> : null}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}

function DeviceRow({ name, type, status, power }: { name: string; type: string; status: "online" | "offline" | "warning"; power: string }) {
  const statusColor = status === "online" ? C.green : status === "warning" ? C.yellow : C.red;
  const statusLabel = status === "online" ? "متصل" : status === "warning" ? "تحذير" : "غير متصل";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, marginLeft: 12, flexShrink: 0, boxShadow: `0 0 6px ${statusColor}` }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: C.fg, fontSize: 13, fontWeight: 500 }}>{name}</div>
        <div style={{ color: C.mutedFg, fontSize: 11 }}>{type}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: C.primary, fontSize: 13, fontWeight: 600 }}>{power}</div>
        <div style={{ color: statusColor, fontSize: 11 }}>{statusLabel}</div>
      </div>
    </div>
  );
}

function AlertRow({ msg, level }: { msg: string; level: "error" | "warn" | "ok" }) {
  const color = level === "error" ? C.red : level === "warn" ? C.yellow : C.green;
  const Icon = level === "error" ? AlertTriangle : level === "warn" ? AlertTriangle : CheckCircle2;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <Icon size={14} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
      <span style={{ color: C.mutedFg, fontSize: 12, lineHeight: 1.5 }}>{msg}</span>
    </div>
  );
}

function MiniChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const w = 200;
  const h = 48;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g-${color.replace("#", "")})`} />
    </svg>
  );
}

const powerHistory = [12, 18, 24, 31, 38, 42, 48, 52, 57, 61, 58, 62, 65, 68, 63, 59, 54, 48, 40, 33, 25, 18, 12, 8];
const batteryHistory = [72, 74, 76, 79, 82, 85, 87, 89, 90, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77];

export default function Dashboard() {
  const now = useClock();
  const powerW = useAnimatedValue(6847);
  const battery = useAnimatedValue(82);
  const temp = useAnimatedValue(34);
  const yield_ = useAnimatedValue(47);

  const timeStr = now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const isDay = now.getHours() >= 6 && now.getHours() < 20;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", direction: "rtl" }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, #ff6b00)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sun size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Sync Solar System</div>
            <div style={{ color: C.mutedFg, fontSize: 11 }}>منصة مراقبة الطاقة الشمسية</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: C.fg, fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{timeStr}</div>
            <div style={{ color: C.mutedFg, fontSize: 11 }}>{dateStr}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.green}18`, border: `1px solid ${C.green}40`, borderRadius: 20, padding: "4px 10px" }}>
            <Wifi size={12} color={C.green} />
            <span style={{ color: C.green, fontSize: 12, fontWeight: 500 }}>مباشر</span>
          </div>
          {isDay ? <Sun size={18} color={C.primary} /> : <Moon size={18} color={C.secondary} />}
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <MetricCard
            label="الطاقة المولّدة"
            value={(powerW / 1000).toFixed(2)}
            unit="kW"
            sub="من 10 kW مثبّتة"
            icon={<Zap size={16} />}
            color={C.primary}
            trend="up"
            trendValue="+12% من أمس"
            bar={powerW / 100}
          />
          <MetricCard
            label="البطارية"
            value={`${battery}`}
            unit="%"
            sub="48V · 200Ah"
            icon={<Battery size={16} />}
            color={C.secondary}
            trend="stable"
            trendValue="مستقرة"
            bar={battery}
          />
          <MetricCard
            label="إنتاج اليوم"
            value={`${yield_}`}
            unit="kWh"
            sub="متوسط: 42 kWh/يوم"
            icon={<BarChart3 size={16} />}
            color="#a855f7"
            trend="up"
            trendValue="+12%"
          />
          <MetricCard
            label="درجة الحرارة"
            value={`${temp}`}
            unit="°C"
            sub="عاكس المنظومة"
            icon={<Thermometer size={16} />}
            color={temp > 40 ? C.red : C.green}
            trend="stable"
            trendValue="طبيعي"
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>منحنى الإنتاج (24 ساعة)</span>
              <span style={{ color: C.primary, fontSize: 12, background: `${C.primary}18`, padding: "2px 8px", borderRadius: 8 }}>اليوم</span>
            </div>
            <MiniChart values={powerHistory} color={C.primary} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {["00", "04", "08", "12", "16", "20", "23"].map(h => (
                <span key={h} style={{ color: C.mutedFg, fontSize: 10 }}>{h}:00</span>
              ))}
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>مستوى البطارية (24 ساعة)</span>
              <span style={{ color: C.secondary, fontSize: 12, background: `${C.secondary}18`, padding: "2px 8px", borderRadius: 8 }}>%</span>
            </div>
            <MiniChart values={batteryHistory} color={C.secondary} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {["00", "04", "08", "12", "16", "20", "23"].map(h => (
                <span key={h} style={{ color: C.mutedFg, fontSize: 10 }}>{h}:00</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Devices */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Cpu size={16} color={C.secondary} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>الأجهزة المتصلة</span>
              <span style={{ marginRight: "auto", background: `${C.green}18`, color: C.green, fontSize: 11, padding: "1px 7px", borderRadius: 8 }}>5 / 6 متصل</span>
            </div>
            <DeviceRow name="عاكس SMA SB5.0" type="Inverter · Modbus TCP" status="online" power="5.2 kW" />
            <DeviceRow name="شاحن MPPT Victron" type="MPPT · VE.Can" status="online" power="3.1 kW" />
            <DeviceRow name="بطارية Pylontech" type="LiFePO4 · CAN BUS" status="online" power="82%" />
            <DeviceRow name="عداد Eastron SDM" type="Smart Meter · Modbus" status="warning" power="8.4 kW" />
            <DeviceRow name="مستشعر Davis" type="Weather · HTTP" status="online" power="34°C" />
            <DeviceRow name="بوابة IoT ESP32" type="Gateway · MQTT" status="offline" power="—" />
          </div>

          {/* Alerts */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Activity size={16} color={C.primary} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>آخر التنبيهات</span>
            </div>
            <AlertRow level="warn" msg="بوابة IoT (ESP32) انقطع اتصالها منذ 18 دقيقة — تحقق من الشبكة" />
            <AlertRow level="warn" msg="عداد Eastron SDM — قراءة تيار غير عادية (112A)" />
            <AlertRow level="ok" msg="تمت إعادة تشغيل العاكس بنجاح في 06:14" />
            <AlertRow level="ok" msg="البطارية وصلت 90% الشحن في 11:42" />
            <AlertRow level="error" msg="انتهاء صلاحية شهادة SSL للبوابة الرئيسية" />
            <AlertRow level="ok" msg="تزامن البيانات مع السحابة — آخر تحديث الآن" />
          </div>

          {/* System Status */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Globe size={16} color="#a855f7" />
              <span style={{ fontWeight: 600, fontSize: 14 }}>حالة النظام</span>
            </div>
            {[
              { label: "أداء المنظومة (PR)", value: "84%", color: C.green, bar: 84 },
              { label: "كفاءة العاكس", value: "97.2%", color: C.secondary, bar: 97 },
              { label: "استخدام البطارية", value: "82%", color: C.primary, bar: 82 },
              { label: "اتصال الشبكة", value: "98ms", color: C.green, bar: 90 },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: C.mutedFg, fontSize: 12 }}>{row.label}</span>
                  <span style={{ color: row.color, fontSize: 12, fontWeight: 600 }}>{row.value}</span>
                </div>
                <div style={{ background: C.muted, borderRadius: 4, height: 5 }}>
                  <div style={{ width: `${row.bar}%`, height: "100%", background: row.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: C.fg, fontSize: 18, fontWeight: 700 }}>142</div>
                <div style={{ color: C.mutedFg, fontSize: 11 }}>kWh هذا الشهر</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: C.fg, fontSize: 18, fontWeight: 700 }}>1,840</div>
                <div style={{ color: C.mutedFg, fontSize: 11 }}>kWh هذا العام</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: C.green, fontSize: 18, fontWeight: 700 }}>921</div>
                <div style={{ color: C.mutedFg, fontSize: 11 }}>kg CO₂ وفّر</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
