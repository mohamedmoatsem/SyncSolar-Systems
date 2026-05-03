import { useGetLatestReadings, useGetReadingsHistory, useCreateReading } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Activity, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

export default function Monitoring() {
  const [metric, setMetric] = useState<string>("power");
  const [hours, setHours] = useState<string>("24");
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: latest } = useGetLatestReadings({ query: { refetchInterval: 5000 } });
  const { data: history, refetch } = useGetReadingsHistory(
    { metric: metric as any, hours: parseInt(hours) },
    { query: { enabled: true } }
  );
  const createReading = useCreateReading();

  const handleSimulate = () => {
    const baseVoltage = 48;
    const baseCurrent = 15;
    createReading.mutate(
      {
        data: {
          voltage: baseVoltage + (Math.random() * 4 - 2),
          current: baseCurrent + (Math.random() * 2 - 1),
          power: baseVoltage * baseCurrent + Math.random() * 100,
          batteryLevel: 85 + Math.random() * 5,
          batteryVoltage: 51.2 + Math.random(),
          temperature: 45 + Math.random() * 10,
          irradiance: 800 + Math.random() * 200,
          loadPower: 400 + Math.random() * 50,
          systemStatus: "normal",
        },
      },
      {
        onSuccess: () => {
          toast({ title: t.monitoring.simulated_title, description: t.monitoring.simulated_desc });
          refetch();
        },
      }
    );
  };

  const getMetricColor = (m: string) => {
    if (m === "power") return "hsl(var(--primary))";
    if (m === "voltage" || m === "battery") return "hsl(var(--secondary))";
    if (m === "current") return "hsl(var(--chart-3))";
    if (m === "temperature") return "hsl(var(--destructive))";
    return "hsl(var(--chart-5))";
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary shrink-0" />
          {t.monitoring.title}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSimulate}
          disabled={createReading.isPending}
          className="border-border w-full sm:w-auto"
        >
          <RefreshCcw className="h-4 w-4 me-2" />
          {t.monitoring.inject_data}
        </Button>
      </div>

      <Card className="border-border bg-card/80">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">
              {t.monitoring.chart_title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power">{t.monitoring.power_output}</SelectItem>
                  <SelectItem value="voltage">{t.monitoring.array_voltage}</SelectItem>
                  <SelectItem value="current">{t.monitoring.array_current}</SelectItem>
                  <SelectItem value="battery">{t.monitoring.battery_level}</SelectItem>
                  <SelectItem value="temperature">{t.monitoring.temperature}</SelectItem>
                  <SelectItem value="irradiance">{t.monitoring.irradiance}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t.monitoring.last_hour}</SelectItem>
                  <SelectItem value="6">{t.monitoring.last_6h}</SelectItem>
                  <SelectItem value="24">{t.monitoring.last_24h}</SelectItem>
                  <SelectItem value="168">{t.monitoring.last_7d}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[250px] sm:h-[350px] lg:h-[400px] w-full" dir="ltr">
            {history && history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) =>
                      new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    }
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "4px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(var(--foreground))", fontFamily: "var(--app-font-mono)" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                    labelFormatter={(val) => new Date(val).toLocaleString()}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="value"
                    stroke={getMetricColor(metric)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: getMetricColor(metric), stroke: "hsl(var(--background))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {t.monitoring.no_data}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {latest &&
          Object.entries(latest).map(([key, val]) => {
            if (["id", "timestamp", "systemStatus"].includes(key)) return null;
            return (
              <Card key={key} className="bg-card/40 border-border">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div className="text-lg sm:text-xl font-data font-bold text-foreground mt-1" dir="ltr">
                    {typeof val === "number" ? val.toFixed(2) : String(val)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
