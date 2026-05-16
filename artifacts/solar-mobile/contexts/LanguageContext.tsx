import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "ar" | "en";

const AR = {
  dashboard: "لوحة التحكم",
  monitoring: "المراقبة",
  devices: "الأجهزة",
  alerts: "التنبيهات",
  aiAssistant: "المساعد الذكي",
  currentPower: "الطاقة الحالية",
  energyToday: "طاقة اليوم",
  energyTotal: "إجمالي الطاقة",
  batteryLevel: "مستوى البطارية",
  systemStatus: "حالة النظام",
  totalDevices: "إجمالي الأجهزة",
  activeAlerts: "تنبيهات نشطة",
  co2Saved: "CO₂ موفر",
  savingsToday: "وفورات اليوم",
  voltage: "الجهد الكهربي",
  current: "التيار",
  power: "الطاقة",
  temperature: "درجة الحرارة",
  irradiance: "الإشعاع الشمسي",
  loadPower: "حمل الطاقة",
  batteryVoltage: "جهد البطارية",
  normal: "طبيعي",
  warning: "تحذير",
  fault: "عطل",
  offline: "غير متصل",
  on: "يعمل",
  off: "متوقف",
  enabled: "مُفعّل",
  disabled: "معطّل",
  toggle: "تبديل",
  resolve: "حل التنبيه",
  resolved: "محلول",
  resolveError: "فشل حل التنبيه — حاول مرة أخرى",
  retryResolve: "إعادة المحاولة",
  active: "نشط",
  all: "الكل",
  critical: "حرج",
  info: "معلومة",
  production: "الإنتاج",
  consumption: "الاستهلاك",
  sendMessage: "إرسال",
  typeMessage: "اكتب سؤالك عن المنظومة...",
  noAlerts: "لا توجد تنبيهات",
  noDevices: "لا توجد أجهزة",
  loading: "جارٍ التحميل...",
  retry: "إعادة المحاولة",
  errorLoad: "تعذّر تحميل البيانات",
  lastUpdated: "آخر تحديث",
  energyChart: "إنتاج الطاقة - اليوم",
  online: "متصل",
  inverter: "محوّل",
  charge_controller: "وحدة الشحن",
  load: "حمل كهربي",
  sensor: "مستشعر",
  pump: "مضخة",
  newChat: "محادثة جديدة",
  aiGreeting: "مرحباً! أنا مساعدك الذكي لمنظومة الطاقة الشمسية. يمكنني مساعدتك في تحليل أداء المنظومة، تفسير القراءات، وتشخيص الأعطال. كيف يمكنني مساعدتك؟",
  devicesOnline: "أجهزة متصلة",
  systemPerformance: "كفاءة المنظومة",
  liveData: "بيانات مباشرة",
  refresh: "تحديث",
  kWh: "كيلوواط/ساعة",
  location: "الموقع",
  type: "النوع",
  powerRating: "القدرة الاسمية",
  filterBy: "تصفية",
  resolvedAt: "وقت الحل",
  occuredAt: "وقت الحدوث",
  cachedData: "بيانات محفوظة",
  offlineMode: "وضع بدون إنترنت",
  deviceConsumption: "استهلاك الأجهزة",
  liveConsumption: "استهلاك فوري",
  currentWatts: "واط حالي",
  totalKwhLabel: "إجمالي (kWh)",
  noConsumptionData: "لا توجد بيانات استهلاك بعد",
  iotEndpointHint: "أرسل بيانات المستشعر إلى: POST /api/device-consumption",
  shareOfTotal: "حصة من الإجمالي",
  totalSystemLoad: "الحمل الكلي",
};

const EN: typeof AR = {
  dashboard: "Dashboard",
  monitoring: "Monitoring",
  devices: "Devices",
  alerts: "Alerts",
  aiAssistant: "AI Assistant",
  currentPower: "Current Power",
  energyToday: "Energy Today",
  energyTotal: "Total Energy",
  batteryLevel: "Battery Level",
  systemStatus: "System Status",
  totalDevices: "Total Devices",
  activeAlerts: "Active Alerts",
  co2Saved: "CO₂ Saved",
  savingsToday: "Savings Today",
  voltage: "Voltage",
  current: "Current",
  power: "Power",
  temperature: "Temperature",
  irradiance: "Irradiance",
  loadPower: "Load Power",
  batteryVoltage: "Battery Voltage",
  normal: "Normal",
  warning: "Warning",
  fault: "Fault",
  offline: "Offline",
  on: "On",
  off: "Off",
  enabled: "Enabled",
  disabled: "Disabled",
  toggle: "Toggle",
  resolve: "Resolve",
  resolved: "Resolved",
  resolveError: "Failed to resolve — try again",
  retryResolve: "Retry",
  active: "Active",
  all: "All",
  critical: "Critical",
  info: "Info",
  production: "Production",
  consumption: "Consumption",
  sendMessage: "Send",
  typeMessage: "Ask about your solar system...",
  noAlerts: "No alerts found",
  noDevices: "No devices found",
  loading: "Loading...",
  retry: "Retry",
  errorLoad: "Failed to load data",
  lastUpdated: "Updated",
  energyChart: "Energy Production — Today",
  online: "Online",
  inverter: "Inverter",
  charge_controller: "Charge Controller",
  load: "Load",
  sensor: "Sensor",
  pump: "Pump",
  newChat: "New Chat",
  aiGreeting: "Hello! I'm your solar energy system AI assistant. I can help you analyze system performance, interpret readings, and diagnose faults. How can I help you?",
  devicesOnline: "Devices Online",
  systemPerformance: "System Efficiency",
  liveData: "Live Data",
  refresh: "Refresh",
  kWh: "kWh",
  location: "Location",
  type: "Type",
  powerRating: "Power Rating",
  filterBy: "Filter",
  resolvedAt: "Resolved At",
  occuredAt: "Occurred At",
  cachedData: "Cached Data",
  offlineMode: "Offline Mode",
  deviceConsumption: "Device Consumption",
  liveConsumption: "Live Consumption",
  currentWatts: "Current (W)",
  totalKwhLabel: "Total (kWh)",
  noConsumptionData: "No consumption data yet",
  iotEndpointHint: "Send sensor data to: POST /api/device-consumption",
  shareOfTotal: "Share of total",
  totalSystemLoad: "Total System Load",
};

interface LangCtx {
  lang: Lang;
  t: typeof AR;
  isRTL: boolean;
  toggleLang: () => void;
}

const LanguageContext = createContext<LangCtx>({
  lang: "ar",
  t: AR,
  isRTL: true,
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    AsyncStorage.getItem("lang").then((v) => {
      if (v === "en" || v === "ar") setLang(v);
    });
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    setLang(next);
    AsyncStorage.setItem("lang", next);
  };

  return (
    <LanguageContext.Provider
      value={{ lang, t: lang === "ar" ? AR : EN, isRTL: lang === "ar", toggleLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
