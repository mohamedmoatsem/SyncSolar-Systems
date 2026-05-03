import { WifiOff, Wifi } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const isOffline = useOffline();
  const { t } = useLanguage();
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (!isOffline) {
      setJustCameOnline(true);
      const timer = setTimeout(() => setJustCameOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!isOffline && !justCameOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium transition-all duration-300 ${
        isOffline
          ? "bg-destructive/90 text-destructive-foreground"
          : "bg-secondary/90 text-secondary-foreground"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{t.sys.offline_banner}</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4 shrink-0" />
          <span>{t.sys.online_banner}</span>
        </>
      )}
    </div>
  );
}
