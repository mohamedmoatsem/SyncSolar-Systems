import { useGetDashboardSummary, useGetLatestReadings, useGetEnergyToday } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Zap, AlertTriangle, CheckCircle2, XCircle, TrendingUp, DollarSign, Leaf } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { refetchInterval: 5000 }
  });
  
  const { data: latest, isLoading: loadingLatest } = useGetLatestReadings({
    query: { refetchInterval: 5000 }
  });

  const { data: energyChart } = useGetEnergyToday();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'normal': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'warning': return 'text-primary bg-primary/10 border-primary/20';
      case 'fault': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'normal': return <CheckCircle2 className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'fault': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loadingSummary || loadingLatest) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-card rounded-sm" />
      <div className="h-64 bg-card rounded-sm" />
    </div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Status</CardTitle>
            {getStatusIcon(summary?.systemStatus)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-data font-bold uppercase mb-1">
              {summary?.systemStatus || 'UNKNOWN'}
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className={getStatusColor(summary?.systemStatus)}>
                {summary?.devicesOnline}/{summary?.totalDevices} Devices
              </Badge>
              {!!summary?.activeAlerts && (
                <Badge variant="outline" className="text-destructive bg-destructive/10 border-destructive/20">
                  {summary.activeAlerts} Alerts
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Power</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-data font-bold text-primary">
              {summary?.currentPower?.toLocaleString()} <span className="text-sm text-muted-foreground">W</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Energy Today: <strong className="font-data text-foreground">{summary?.energyToday?.toFixed(1)} kWh</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Battery Level</CardTitle>
            <Battery className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-data font-bold text-secondary">
              {summary?.batteryLevel?.toFixed(1)} <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="w-full bg-muted h-1.5 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-secondary h-full transition-all duration-500" 
                style={{ width: `${summary?.batteryLevel || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Impact Today</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-data font-bold text-lg">${summary?.savingsToday?.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">Saved</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                <span className="font-data font-bold text-lg">{summary?.co2Saved?.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">kg CO₂</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Row */}
      <Card className="border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Energy Production vs Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {energyChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}W`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--app-font-mono)' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="production" name="Production" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorProd)" />
                  <Area type="monotone" dataKey="consumption" name="Consumption" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorCons)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">NO DATA</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live SCADA Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Array Voltage', value: latest?.voltage, unit: 'V' },
          { label: 'Array Current', value: latest?.current, unit: 'A' },
          { label: 'Irradiance', value: latest?.irradiance, unit: 'W/m²' },
          { label: 'Panel Temp', value: latest?.temperature, unit: '°C' },
          { label: 'Battery Voltage', value: latest?.batteryVoltage, unit: 'V' },
          { label: 'Load Power', value: latest?.loadPower, unit: 'W' },
        ].map((item, i) => (
          <Card key={i} className="bg-card/40 border-border">
            <CardContent className="p-4 flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-data font-bold text-foreground">{item.value?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-muted-foreground font-data">{item.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
