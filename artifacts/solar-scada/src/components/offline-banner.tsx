import { WifiOff, Wifi } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const isOffline = useOffline();
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (!isOffline) {
      setJustCameOnline(true);
      const t = setTimeout(() => setJustCameOnline(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOffline]);

  if (!isOffline && !justCameOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-2 text-sm font-mono font-medium transition-all duration-300 ${
        isOffline
          ? "bg-destructive/90 text-destructive-foreground"
          : "bg-secondary/90 text-secondary-foreground"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>OFFLINE — عرض البيانات المخزّنة مؤقتًا. بعض الميزات قد لا تعمل.</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4 shrink-0" />
          <span>ONLINE — تم استعادة الاتصال بالشبكة</span>
        </>
      )}
    </div>
  );
}
