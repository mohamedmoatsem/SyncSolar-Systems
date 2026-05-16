import { BookOpen, LayoutDashboard, Activity, Cpu, AlertTriangle, Bot, Database, Smartphone, User, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Section {
  icon: React.ReactNode;
  titleAr: string;
  titleEn: string;
  items: { ar: string; en: string }[];
}

const sections: Section[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    titleAr: "لوحة التحكم",
    titleEn: "Dashboard",
    items: [
      { ar: "تعرض حالة النظام الكلية في الوقت الحقيقي (طاقة حالية، بطارية، طاقة الأحمال)", en: "Shows real-time system status (current power, battery level, load power)" },
      { ar: "كروت تحليل سريع: إنتاج اليوم، CO₂ الموفَّر، الأجهزة النشطة، التنبيهات", en: "Quick insight cards: today's energy, CO₂ saved, active devices, alerts" },
      { ar: "رسم بياني تفاعلي لإنتاج الطاقة مقابل الاستهلاك", en: "Interactive chart: energy production vs consumption" },
      { ar: "بيانات أجهزة الاستشعار: الجهد، التيار، الإشعاع الشمسي، درجة الحرارة", en: "Sensor readings: voltage, current, irradiance, temperature" },
    ],
  },
  {
    icon: <Activity className="h-5 w-5" />,
    titleAr: "صفحة المراقبة",
    titleEn: "Monitoring",
    items: [
      { ar: "رسوم بيانية تاريخية للقياسات: الطاقة، الجهد، التيار، البطارية، الحرارة، الإشعاع", en: "Historical charts for: power, voltage, current, battery, temperature, irradiance" },
      { ar: "اختر نطاقاً زمنياً: آخر ساعة، 6 ساعات، 24 ساعة، 7 أيام", en: "Choose time range: last hour, 6h, 24h, 7 days" },
      { ar: "زر 'حقن بيانات' لمحاكاة قراءة جديدة (للمطورين والفنيين فقط)", en: "'Inject Data' button to simulate a new reading (technicians only)" },
    ],
  },
  {
    icon: <Cpu className="h-5 w-5" />,
    titleAr: "صفحة الأجهزة",
    titleEn: "Devices",
    items: [
      { ar: "عرض جميع الأجهزة المتصلة: العاكس، وحدة تحكم الشحن، المضخة، المستشعرات", en: "View all connected devices: inverter, charge controller, pump, sensors" },
      { ar: "تفعيل/تعطيل كل جهاز بضغطة زر (المفتاح الجانبي)", en: "Enable/disable each device with a toggle switch" },
      { ar: "عرض حالة كل جهاز: يعمل ✓، متوقف، عطل", en: "View device status: on ✓, off, fault" },
      { ar: "رسم بياني لاستهلاك طاقة الأجهزة خلال الوقت", en: "Power consumption chart per device over time" },
      { ar: "ملاحظة: تغيير حالة الجهاز يتطلب اتصالاً بالإنترنت", en: "Note: changing device state requires internet connection" },
    ],
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    titleAr: "صفحة التنبيهات",
    titleEn: "Alerts",
    items: [
      { ar: "التنبيهات النشطة: جميع المشاكل التي تحتاج تدخلاً فورياً", en: "Active alerts: all issues requiring immediate action" },
      { ar: "السجل: التنبيهات المحلولة مع تاريخ ووقت الحل", en: "History tab: resolved alerts with resolution timestamps" },
      { ar: "مستويات الخطورة: حرج 🔴، تحذير 🟡، معلومات 🔵", en: "Severity levels: critical 🔴, warning 🟡, info 🔵" },
      { ar: "زر 'تأكيد' يؤشر على التنبيه كمحلول وينقله إلى السجل", en: "'Acknowledge' button marks the alert as resolved and moves it to history" },
      { ar: "أنواع التنبيهات: ارتفاع حرارة، انخفاض بطارية، زيادة جهد، عطل عاكس", en: "Alert types: overtemperature, low battery, overvoltage, inverter fault" },
    ],
  },
  {
    icon: <Bot className="h-5 w-5" />,
    titleAr: "المساعد الذكي",
    titleEn: "AI Assistant",
    items: [
      { ar: "مساعد مدعوم بنموذج Gemini 2.5 Flash يعرف بياناتك الحقيقية", en: "AI assistant powered by Gemini 2.5 Flash with access to your live system data" },
      { ar: "اسأل عن: حالة النظام، التنبيهات، الأجهزة، الطاقة المنتجة", en: "Ask about: system status, alerts, devices, energy production" },
      { ar: "يشخّص المشاكل ويقترح حلولاً تقنية دقيقة", en: "Diagnoses problems and suggests precise technical solutions" },
      { ar: "الردود تصل مباشرة (streaming) دون انتظار", en: "Responses stream in real-time, no waiting" },
      { ar: "زر 'محادثة جديدة' لبدء جلسة جديدة في أي وقت", en: "'New Chat' button to start a fresh session anytime" },
      { ar: "يتطلب اتصالاً بالإنترنت", en: "Requires internet connection" },
    ],
  },
  {
    icon: <Database className="h-5 w-5" />,
    titleAr: "السجلات",
    titleEn: "Logs",
    items: [
      { ar: "جدول كامل لجميع قراءات أجهزة الاستشعار مع الطوابع الزمنية", en: "Full table of all sensor readings with timestamps" },
      { ar: "يمكن تصفية السجلات حسب النظام والوقت", en: "Filter logs by system and time range" },
      { ar: "بيانات خام: جهد، تيار، طاقة، بطارية، حرارة، إشعاع، طاقة الحمل", en: "Raw data: voltage, current, power, battery, temperature, irradiance, load power" },
    ],
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    titleAr: "التطبيق المحمول",
    titleEn: "Mobile App",
    items: [
      { ar: "افتح تطبيق Expo Go وامسح رمز QR من لوحة التطوير لتشغيل التطبيق", en: "Open Expo Go app and scan QR code from the dev panel to run the app" },
      { ar: "5 تبويبات رئيسية: لوحة التحكم، المراقبة، الأجهزة، التنبيهات، المساعد الذكي", en: "5 main tabs: Dashboard, Monitoring, Devices, Alerts, AI Assistant" },
      { ar: "يدعم العمل في وضع عدم الاتصال مع البيانات المخزّنة مؤقتاً", en: "Supports offline mode with cached data" },
      { ar: "الضغط على أيقونة في شريط التبويب السفلي للتنقل بين الصفحات", en: "Tap icons in the bottom tab bar to navigate between screens" },
      { ar: "اسحب للأسفل في أي صفحة لتحديث البيانات", en: "Pull down on any screen to refresh data" },
    ],
  },
  {
    icon: <User className="h-5 w-5" />,
    titleAr: "أنواع الحسابات",
    titleEn: "Account Types",
    items: [
      { ar: "فني (Technician): يرى جميع الأنظمة، ويمكنه حقن البيانات والتحكم الكامل", en: "Technician: sees all systems, can inject data and has full control" },
      { ar: "عميل (Client): يرى نظامه الخاص فقط، بيانات القراءة والتنبيهات", en: "Client: sees only their own system, read data and alerts" },
      { ar: "تسجيل الخروج: اضغط على أيقونة الخروج في الشريط العلوي أو في القائمة الجانبية", en: "Logout: press the logout icon in the top bar or sidebar" },
    ],
  },
];

const alertSolutions: { type: string; typeAr: string; solutions: { ar: string; en: string }[] }[] = [
  {
    type: "overtemperature",
    typeAr: "ارتفاع درجة الحرارة",
    solutions: [
      { ar: "نظّف الألواح الشمسية من الأتربة والغبار", en: "Clean solar panels from dust and dirt" },
      { ar: "تأكد من التهوية الجيدة حول الجهاز", en: "Ensure adequate ventilation around the equipment" },
      { ar: "فحص مروحة التبريد في العاكس إن وُجدت", en: "Check inverter cooling fan if applicable" },
    ],
  },
  {
    type: "low_battery",
    typeAr: "انخفاض مستوى البطارية",
    solutions: [
      { ar: "تحقق من نشاط وحدة تحكم الشحن MPPT", en: "Check MPPT charge controller activity" },
      { ar: "قلل الأحمال المتصلة خلال الليل", en: "Reduce connected loads during nighttime" },
      { ar: "تحقق من سلامة اتصالات البطارية", en: "Inspect battery connections for corrosion" },
    ],
  },
  {
    type: "overvoltage",
    typeAr: "ارتفاع الجهد",
    solutions: [
      { ar: "تحقق من إعدادات منظم الجهد", en: "Check voltage regulator settings" },
      { ar: "افصل بعض الأحمال مؤقتاً", en: "Temporarily disconnect some loads" },
      { ar: "تأكد من صحة قراءات مستشعر الجهد", en: "Verify voltage sensor readings accuracy" },
    ],
  },
  {
    type: "inverter_fault",
    typeAr: "عطل العاكس",
    solutions: [
      { ar: "أعد تشغيل العاكس (إيقاف ثم تشغيل)", en: "Restart the inverter (power off, then on)" },
      { ar: "تحقق من اتصالات الكابلات", en: "Check cable connections" },
      { ar: "راجع كود الخطأ في شاشة العاكس", en: "Check error code on inverter display" },
    ],
  },
];

export default function UserGuide() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-sm" style={{ background: "rgba(255,140,26,0.12)" }}>
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight uppercase">{t.nav.user_guide}</h2>
          <p className="text-sm text-muted-foreground font-mono">
            {isAr ? "دليل استخدام منصة SyncSolar Systems" : "SyncSolar Systems Usage Guide"}
          </p>
        </div>
      </div>

      {/* Quick start */}
      <div className="rounded-sm border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-primary uppercase tracking-wider">
            {isAr ? "حسابات تجريبية للتجربة السريعة" : "Demo Accounts for Quick Testing"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-card rounded-sm border border-border p-3">
            <p className="text-xs font-mono text-secondary mb-1">{isAr ? "حساب الفني" : "Technician"}</p>
            <p className="text-sm font-medium">tech@syncsolar.com</p>
            <p className="text-xs text-muted-foreground font-mono">tech1234</p>
          </div>
          <div className="bg-card rounded-sm border border-border p-3">
            <p className="text-xs font-mono text-primary mb-1">{isAr ? "حساب العميل" : "Client"}</p>
            <p className="text-sm font-medium">client@syncsolar.com</p>
            <p className="text-xs text-muted-foreground font-mono">client1234</p>
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => (
          <div key={i} className="rounded-sm border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3 text-primary">
              {section.icon}
              <h3 className="font-bold text-sm uppercase tracking-wide">
                {isAr ? section.titleAr : section.titleEn}
              </h3>
            </div>
            <ul className="space-y-1.5">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-secondary mt-0.5 shrink-0">›</span>
                  <span>{isAr ? item.ar : item.en}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Alert Solutions */}
      <div>
        <h3 className="text-base font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {isAr ? "حلول مقترحة للتنبيهات الشائعة" : "Suggested Solutions for Common Alerts"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {alertSolutions.map((alert, i) => (
            <div key={i} className="rounded-sm border border-border bg-card p-4">
              <p className="text-sm font-bold text-warning mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {isAr ? alert.typeAr : alert.type.replace("_", " ").toUpperCase()}
              </p>
              <ul className="space-y-1">
                {alert.solutions.map((s, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-secondary mt-0.5 shrink-0">{j + 1}.</span>
                    <span>{isAr ? s.ar : s.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center font-mono pb-4">
        SyncSolar Systems v2026 · {isAr ? "للدعم التقني تواصل مع مزود الخدمة" : "For technical support, contact your service provider"}
      </p>
    </div>
  );
}
