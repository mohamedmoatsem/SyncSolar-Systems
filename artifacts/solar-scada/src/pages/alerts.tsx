import { useListAlerts, useResolveAlert, getGetAlertsSummaryQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: activeAlerts } = useListAlerts({ status: 'active' as any });
  const { data: resolvedAlerts } = useListAlerts({ status: 'resolved' as any });
  const resolveMutation = useResolveAlert();

  const handleResolve = (id: number) => {
    resolveMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Alert Resolved", description: "The alert has been marked as resolved." });
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        queryClient.invalidateQueries({ queryKey: getGetAlertsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  const getSeverityStyles = (sev: string) => {
    if (sev === 'critical') return 'bg-destructive/10 text-destructive border-destructive/30';
    if (sev === 'warning') return 'bg-primary/10 text-primary border-primary/30';
    return 'bg-secondary/10 text-secondary border-secondary/30';
  };

  const renderAlertList = (alerts: any[], isActive: boolean) => {
    if (!alerts || alerts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed border-border rounded-sm bg-card/30">
          <CheckCircle className="h-8 w-8 mb-2 opacity-50" />
          <p className="uppercase text-sm tracking-widest">No {isActive ? 'Active' : 'Resolved'} Alerts</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {alerts.map(alert => (
          <Card key={alert.id} className={`border-border bg-card/80 ${isActive && alert.severity === 'critical' ? 'border-destructive/50 shadow-[0_0_10px_rgba(255,0,0,0.1)]' : ''}`}>
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-sm border ${getSeverityStyles(alert.severity)}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] uppercase font-mono ${getSeverityStyles(alert.severity)}`}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground uppercase">{alert.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.timestamp).toLocaleString()}
                    {alert.resolvedAt && (
                      <span className="text-secondary ml-2">Resolved: {new Date(alert.resolvedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              {isActive && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="shrink-0 border-border hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30"
                  onClick={() => handleResolve(alert.id)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Acknowledge
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <h2 className="text-xl font-bold tracking-tight uppercase">Alert Management</h2>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start rounded-sm p-1">
          <TabsTrigger value="active" className="text-xs uppercase tracking-widest font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm">
            Active Alarms {activeAlerts?.length ? `(${activeAlerts.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs uppercase tracking-widest font-mono data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-sm">
            History
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
