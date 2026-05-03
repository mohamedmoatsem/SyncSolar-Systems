import { useListDevices, useToggleDevice } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Power, Cpu, Server, Waves, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDevicesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

export default function Devices() {
  const { data: devices, isLoading } = useListDevices();
  const toggleMutation = useToggleDevice();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleToggle = (id: number, currentEnabled: boolean) => {
    toggleMutation.mutate(
      { id, data: { isEnabled: !currentEnabled } },
      {
        onSuccess: () => {
          toast({ title: t.devices.updated, description: t.devices.updated_desc });
          queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
        },
        onError: () => {
          toast({ title: t.devices.error, description: t.devices.error_desc, variant: "destructive" });
        },
      }
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "inverter": return <Zap className="h-5 w-5 text-primary" />;
      case "charge_controller": return <Server className="h-5 w-5 text-secondary" />;
      case "pump": return <Waves className="h-5 w-5 text-blue-500" />;
      case "sensor": return <Cpu className="h-5 w-5 text-green-500" />;
      default: return <Power className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "fault")
      return <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">{t.status.fault}</Badge>;
    if (status === "on")
      return <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">{t.status.on}</Badge>;
    return <Badge variant="outline" className="text-muted-foreground border-muted/30">{t.status.off}</Badge>;
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
        <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase">{t.devices.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && <div className="col-span-full h-32 bg-card animate-pulse rounded-sm" />}

        {devices?.map((device) => (
          <Card key={device.id} className="border-border bg-card/80 relative overflow-hidden group">
            <div
              className={`absolute top-0 bottom-0 w-1 ${
                device.status === "fault"
                  ? "bg-destructive"
                  : device.isEnabled
                  ? "bg-secondary"
                  : "bg-muted-foreground"
              }`}
              style={{ insetInlineStart: 0 }}
            />

            <CardHeader className="ps-6 pb-2">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-background/50 rounded-sm border border-border shrink-0">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm uppercase tracking-wider truncate">{device.name}</CardTitle>
                    <CardDescription className="text-xs font-mono truncate">
                      {device.location} • <span dir="ltr">{device.powerRating}W</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {getStatusBadge(device.status)}
                  <Switch
                    checked={device.isEnabled}
                    onCheckedChange={() => handleToggle(device.id, device.isEnabled)}
                    disabled={toggleMutation.isPending || device.status === "fault"}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="ps-6 pt-2">
              <div className="flex items-center gap-4 text-xs font-mono" dir="ltr">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">{t.devices.id}</span>
                  <span>DEV_{device.id.toString().padStart(4, "0")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">{t.devices.type}</span>
                  <span className="uppercase">{device.type.replace("_", " ")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
