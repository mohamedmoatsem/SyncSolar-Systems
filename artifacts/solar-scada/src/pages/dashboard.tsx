import { useGetDashboardSummary, useGetLatestReadings, useGetEnergyToday } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Zap, AlertTriangle, CheckCircle2, XCircle, TrendingUp, DollarSign, Leaf } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useLanguage } from "@/contexts/language-context";

export default function Dashboard() {
  const { t } = useLanguage();

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { refetchInterval: 5000, queryKey: [] },
  });
  const { data: latest, isLoading: loadingLatest } = useGetLatestReadings({
    query: { refetchInterval: 5000, queryKey: [] },
  });
  const { data: energyChart } = useGetEnergyToday();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "normal": return "text-secondary bg-secondary/10 border-secondary/20";
      case "warning": return "text-primary bg-primary/10 border-primary/20";
      case "fault": return "text-destructive bg-destructive/10 border-destructive/20";
      default: return "text-muted-foreground bg-muted/10 border-muted/20";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "normal": return t.status.normal;
      case "warning": return t.status.warning;
      case "fault": return t.status.fault;
      default: return t.status.unknown;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "normal": return <CheckCircle2 className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "fault": return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loadingSummary || loadingLatest) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-card rounded-sm" />)}
        </div>
        <div className="h-56 bg-card rounded-sm" />
      </div>
    );
  }

  const scadaItems = [
    { label: t.dashboard.array_voltage, value: latest?.voltage, unit: "V" },
    { label: t.dashboard.array_current, value: latest?.current, unit: "A" },
    { label: t.dashboard.irradiance, value: latest?.irradiance, unit: "W/m²" },
    { label: t.dashboard.panel_temp, value: latest?.temperature, unit: "°C" },
    { label: t.dashboard.battery_v, value: latest?.batteryVoltage, unit: "V" },
    { label: t.dashboard.load_power, value: latest?.loadPower, unit: "W" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 pt-3 px-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t.dashboard.system_status}
            </CardTitle>
            {getStatusIcon(summary?.systemStatus)}
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-data font-bold uppercase mb-1" dir="ltr">
              {getStatusLabel(summary?.systemStatus)}
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <Badge variant="outline" className={`text-[9px] sm:text-xs ${getStatusColor(summary?.systemStatus)}`}>
                <span dir="ltr">{summary?.devicesOnline}/{summary?.totalDevices}</span>
                <span className="ms-1">{t.dashboard.devices_label}</span>
              </Badge>
              {!!summary?.activeAlerts && (
                <Badge variant="outline" className="text-[9px] sm:text-xs text-destructive bg-destructive/10 border-destructive/20">
                  <span dir="ltr">{summary.activeAlerts}</span>
                  <span className="ms-1">{t.dashboard.alerts_label}</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 pt-3 px-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t.dashboard.current_power}
            </CardTitle>
            <Zap className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-data font-bold text-primary" dir="ltr">
              {summary?.currentPower?.toLocaleString()}
              <span className="text-xs sm:text-sm text-muted-foreground ms-1">W</span>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>
                {t.dashboard.today}:{" "}
                <strong className="font-data text-foreground" dir="ltr">
                  {summary?.energyToday?.toFixed(1)} kWh
                </strong>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 pt-3 px-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t.dashboard.battery_level}
            </CardTitle>
            <Battery className="h-4 w-4 text-secondary shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-data font-bold text-secondary" dir="ltr">
              {summary?.batteryLevel?.toFixed(1)}
              <span className="text-xs sm:text-sm text-muted-foreground ms-1">%</span>
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
          <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 pt-3 px-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t.dashboard.impact_today}
            </CardTitle>
            <Leaf className="h-4 w-4 text-green-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <span className="font-data font-bold text-base sm:text-lg" dir="ltr">
                  ${summary?.savingsToday?.toFixed(2)}
                </span>
                <span className="text-[10px] text-muted-foreground">{t.dashboard.saved}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <span className="font-data font-bold text-base sm:text-lg" dir="ltr">
                  {summary?.co2Saved?.toFixed(1)}
                </span>
                <span className="text-[10px] text-muted-foreground">kg CO₂</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-border bg-card/80">
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-xs sm:text-sm font-medium uppercase tracking-wider">
            {t.dashboard.energy_chart}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
          <div className="h-[200px] sm:h-[260px] lg:h-[300px] w-full" dir="ltr">
            {energyChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyChart} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}W`} width={48} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "4px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(var(--foreground))", fontFamily: "var(--app-font-mono)" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {scadaItems.map((item, i) => (
          <Card key={i} className="bg-card/40 border-border">
            <CardContent className="p-3 flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1 mt-1" dir="ltr">
                <span className="text-base sm:text-xl font-data font-bold text-foreground">
                  {item.value?.toFixed(1) || "0.0"}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-data">{item.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
