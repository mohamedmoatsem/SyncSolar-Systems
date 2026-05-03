import { useListAlerts, useResolveAlert, getGetAlertsSummaryQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: activeAlerts } = useListAlerts({ status: "active" as any });
  const { data: resolvedAlerts } = useListAlerts({ status: "resolved" as any });
  const resolveMutation = useResolveAlert();

  const handleResolve = (id: number) => {
    resolveMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: t.alerts.resolved_toast, description: t.alerts.resolved_toast_desc });
          queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
          queryClient.invalidateQueries({ queryKey: getGetAlertsSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
      }
    );
  };

  const getSeverityStyles = (sev: string) => {
    if (sev === "critical") return "bg-destructive/10 text-destructive border-destructive/30";
    if (sev === "warning") return "bg-primary/10 text-primary border-primary/30";
    return "bg-secondary/10 text-secondary border-secondary/30";
  };

  const getSeverityLabel = (sev: string) => {
    if (sev === "critical") return t.severity.critical;
    if (sev === "warning") return t.severity.warning;
    return t.severity.info;
  };

  const renderAlertList = (alerts: any[], isActive: boolean) => {
    if (!alerts || alerts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-muted-foreground border border-dashed border-border rounded-sm bg-card/30">
          <CheckCircle className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm tracking-widest">
            {isActive ? t.alerts.no_active : t.alerts.no_resolved}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`border-border bg-card/80 ${
              isActive && alert.severity === "critical"
                ? "border-destructive/50 shadow-[0_0_10px_rgba(255,0,0,0.1)]"
                : ""
            }`}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className={`p-2 rounded-sm border shrink-0 ${getSeverityStyles(alert.severity)}`}>
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${getSeverityStyles(alert.severity)}`}
                    >
                      {getSeverityLabel(alert.severity)}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      {alert.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-mono flex-wrap" dir="ltr">
                    <Clock className="h-3 w-3 shrink-0" />
                    {new Date(alert.timestamp).toLocaleString()}
                    {alert.resolvedAt && (
                      <span className="text-secondary">
                        {t.alerts.resolved_label}: {new Date(alert.resolvedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-border hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30 w-full sm:w-auto"
                  onClick={() => handleResolve(alert.id)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 me-2" />
                  {t.alerts.acknowledge}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive shrink-0" />
        <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase">{t.alerts.title}</h2>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start rounded-sm p-1">
          <TabsTrigger
            value="active"
            className="text-xs uppercase tracking-widest font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm"
          >
            {t.alerts.active_tab}
            {activeAlerts?.length ? (
              <span dir="ltr" className="ms-1">({activeAlerts.length})</span>
            ) : ""}
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="text-xs uppercase tracking-widest font-mono data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-sm"
          >
            {t.alerts.history_tab}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {renderAlertList(activeAlerts || [], true)}
        </TabsContent>
        <TabsContent value="resolved" className="mt-4">
          {renderAlertList(resolvedAlerts || [], false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
