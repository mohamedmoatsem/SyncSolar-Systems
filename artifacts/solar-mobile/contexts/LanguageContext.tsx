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
  batteryLevel: "مستوى البطارية",
  systemStatus: "حالة النظام",
  totalDevices: "إجمالي الأجهزة",
  activeAlerts: "تنبيهات نشطة",
  co2Saved: "CO₂ موفر",
  savingsToday: "وفورات اليوم",
  voltage: "الجهد",
  current: "التيار",
  power: "الطاقة",
  temperature: "الحرارة",
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
  resolve: "حل",
  resolved: "محلول",
  active: "نشط",
  critical: "حرج",
  info: "معلومة",
  production: "الإنتاج",
  consumption: "الاستهلاك",
  sendMessage: "أرسل رسالة",
  typeMessage: "اكتب سؤالك...",
  noAlerts: "لا توجد تنبيهات",
  noDevices: "لا توجد أجهزة",
  loading: "جارٍ التحميل...",
  retry: "إعادة المحاولة",
  errorLoad: "تعذر تحميل البيانات",
  lastUpdated: "آخر تحديث",
  energyChart: "إنتاج الطاقة اليوم",
  online: "متصل",
  inverter: "محول",
  charge_controller: "وحدة الشحن",
  load: "حمل",
  sensor: "مستشعر",
  pump: "مضخة",
  newChat: "محادثة جديدة",
  aiGreeting: "مرحباً! أنا مساعدك الذكي لنظام الطاقة الشمسية. كيف يمكنني مساعدتك؟",
  devicesOnline: "أجهزة متصلة",
};

const EN: typeof AR = {
  dashboard: "Dashboard",
  monitoring: "Monitoring",
  devices: "Devices",
  alerts: "Alerts",
  aiAssistant: "AI Assistant",
  currentPower: "Current Power",
  energyToday: "Energy Today",
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
  active: "Active",
  critical: "Critical",
  info: "Info",
  production: "Production",
  consumption: "Consumption",
  sendMessage: "Send",
  typeMessage: "Ask anything...",
  noAlerts: "No alerts",
  noDevices: "No devices",
  loading: "Loading...",
  retry: "Retry",
  errorLoad: "Failed to load data",
  lastUpdated: "Last updated",
  energyChart: "Energy Today",
  online: "Online",
  inverter: "Inverter",
  charge_controller: "Charge Controller",
  load: "Load",
  sensor: "Sensor",
  pump: "Pump",
  newChat: "New Chat",
  aiGreeting: "Hello! I'm your solar energy system AI assistant. How can I help you?",
  devicesOnline: "Devices Online",
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
