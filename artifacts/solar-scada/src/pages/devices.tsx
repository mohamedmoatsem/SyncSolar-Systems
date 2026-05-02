import { useListDevices, useToggleDevice } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Power, Cpu, Server, Waves, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDevicesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Devices() {
  const { data: devices, isLoading } = useListDevices();
  const toggleMutation = useToggleDevice();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleToggle = (id: number, currentEnabled: boolean) => {
    toggleMutation.mutate({
      id,
      data: { isEnabled: !currentEnabled }
    }, {
      onSuccess: () => {
        toast({ title: "Device Updated", description: "Device state changed successfully." });
        queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to toggle device.", variant: "destructive" });
      }
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'inverter': return <Zap className="h-5 w-5 text-primary" />;
      case 'charge_controller': return <Server className="h-5 w-5 text-secondary" />;
      case 'pump': return <Waves className="h-5 w-5 text-blue-500" />;
      case 'sensor': return <Cpu className="h-5 w-5 text-green-500" />;
      default: return <Power className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'fault') return <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">FAULT</Badge>;
    if (status === 'on') return <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">ON</Badge>;
    return <Badge variant="outline" className="text-muted-foreground border-muted/30">OFF</Badge>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Cpu className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold tracking-tight uppercase">Device Control Panel</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && <div className="col-span-full h-32 bg-card animate-pulse rounded-sm" />}
        
        {devices?.map((device) => (
          <Card key={device.id} className="border-border bg-card/80 relative overflow-hidden group">
            {/* Status accent line */}
            <div className={`absolute top-0 left-0 w-1 h-full ${device.status === 'fault' ? 'bg-destructive' : device.isEnabled ? 'bg-secondary' : 'bg-muted-foreground'}`} />
            
            <CardHeader className="pl-6 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background/50 rounded-sm border border-border">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <CardTitle className="text-sm uppercase tracking-wider">{device.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">{device.location} • {device.powerRating}W</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(device.status)}
                  <Switch 
                    checked={device.isEnabled} 
                    onCheckedChange={() => handleToggle(device.id, device.isEnabled)}
                    disabled={toggleMutation.isPending || device.status === 'fault'}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-6 pt-2">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">ID</span>
                  <span>DEV_{device.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">TYPE</span>
                  <span className="uppercase">{device.type.replace('_', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
