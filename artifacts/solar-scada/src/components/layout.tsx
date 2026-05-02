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
  WifiOff,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOffline } from "@/hooks/useOffline";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/logs", label: "Logs", icon: Database },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
];

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span>
      {now.toISOString().split("T")[0]}{" "}
      {now.toISOString().split("T")[1].substring(0, 8)}
    </span>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const isOffline = useOffline();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider">
            <Zap className="h-5 w-5" />
            <span>SOLAR_SCADA</span>
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
                  <span className="ml-auto text-xs text-destructive font-mono">
                    OFFLINE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            {isOffline ? (
              <>
                <WifiOff className="h-4 w-4 text-destructive" />
                <span className="text-destructive">OFFLINE_MODE</span>
              </>
            ) : (
              <>
                <TerminalSquare className="h-4 w-4" />
                <span>SYS_ONLINE_OK</span>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

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
            <h1 className="text-sm sm:text-lg font-semibold tracking-tight uppercase">
              {navItems.find((i) => i.href === location)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {isOffline ? (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-destructive">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">CACHED DATA</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-secondary">LIVE</span>
              </div>
            )}
            <div className="hidden sm:block text-xs text-muted-foreground font-mono">
              <LiveClock />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-3 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
