import { Link, useLocation } from "wouter";
import {
  Activity,
  Cpu,
  AlertTriangle,
  Database,
  LayoutDashboard,
  Zap,
  TerminalSquare,
  Bot,
  BookOpen,
  WifiOff,
  Menu,
  X,
  Languages,
  LogOut,
  User,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOffline } from "@/hooks/useOffline";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono" dir="ltr">
      {now.toISOString().split("T")[0]}{" "}
      {now.toISOString().split("T")[1].substring(0, 8)}
    </span>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const isOffline = useOffline();
  const { t, lang } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/monitoring", label: t.nav.monitoring, icon: Activity },
    { href: "/devices", label: t.nav.devices, icon: Cpu },
    { href: "/alerts", label: t.nav.alerts, icon: AlertTriangle },
    { href: "/logs", label: t.nav.logs, icon: Database },
    { href: "/ai-assistant", label: t.nav.ai_assistant, icon: Bot },
    { href: "/user-guide", label: t.nav.user_guide, icon: BookOpen },
    { href: "/iot-guide", label: t.nav.iot_guide, icon: Wifi },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-40 w-64 flex-shrink-0 border-sidebar-border bg-sidebar flex flex-col transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0 lg:z-auto",
          lang === "ar"
            ? "right-0 border-l lg:border-l lg:border-r-0"
            : "left-0 border-r",
          open
            ? "translate-x-0"
            : lang === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
            <Zap className="h-5 w-5 shrink-0" />
            <span className="font-mono text-sm">SOLAR_SCADA</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-sidebar-primary" : "text-muted-foreground"
                  )}
                />
                {item.label}
                {item.href === "/ai-assistant" && isOffline && (
                  <span className="ms-auto text-xs text-destructive font-mono">
                    OFFLINE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        {user && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm mb-2"
              style={{ background: "rgba(255,140,26,0.05)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,140,26,0.15)" }}>
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground"
                  style={{ fontSize: "10px" }}>
                  {user.role === "technician" ? "فني" : "عميل"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            {isOffline ? (
              <>
                <WifiOff className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-destructive">{t.sys.offline_mode}</span>
              </>
            ) : (
              <>
                <TerminalSquare className="h-4 w-4 shrink-0" />
                <span>{t.sys.online}</span>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isOffline = useOffline();
  const { t, lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const navItems = [
    { href: "/", label: t.nav.dashboard },
    { href: "/monitoring", label: t.nav.monitoring },
    { href: "/devices", label: t.nav.devices },
    { href: "/alerts", label: t.nav.alerts },
    { href: "/logs", label: t.nav.logs },
    { href: "/ai-assistant", label: t.nav.ai_assistant },
    { href: "/user-guide", label: t.nav.user_guide },
    { href: "/iot-guide", label: t.nav.iot_guide },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/50 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm sm:text-base font-semibold tracking-tight uppercase">
              {navItems.find((i) => i.href === location)?.label || t.nav.dashboard}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isOffline ? (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-destructive">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">{t.sys.cached_data}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-secondary">{t.sys.live}</span>
              </div>
            )}
            <div className="hidden sm:block text-xs text-muted-foreground">
              <LiveClock />
            </div>
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
              title={t.lang.switch}
            >
              <Languages className="h-3.5 w-3.5 shrink-0" />
              <span>{t.lang.switch}</span>
            </button>
            {/* User badge + logout in header */}
            {user && (
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border text-xs text-muted-foreground"
                  style={{ borderColor: "rgba(255,140,26,0.3)", background: "rgba(255,140,26,0.05)" }}>
                  <User className="h-3 w-3 text-primary" />
                  <span className="text-primary font-medium max-w-24 truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2 py-1 rounded-sm border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-3 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
