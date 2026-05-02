import { useGetLatestReadings, useGetReadingsHistory, useCreateReading } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Activity, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Monitoring() {
  const [metric, setMetric] = useState<string>("power");
  const [hours, setHours] = useState<string>("24");
  const { toast } = useToast();

  const { data: latest } = useGetLatestReadings({
    query: { refetchInterval: 5000 }
  });

  const { data: history, refetch } = useGetReadingsHistory({
    metric: metric as any,
    hours: parseInt(hours)
  }, {
    query: { enabled: true }
  });

  const createReading = useCreateReading();

  const handleSimulate = () => {
    // Generate a random mock reading
    const baseVoltage = 48;
    const baseCurrent = 15;
    createReading.mutate({
      data: {
        voltage: baseVoltage + (Math.random() * 4 - 2),
        current: baseCurrent + (Math.random() * 2 - 1),
        power: baseVoltage * baseCurrent + (Math.random() * 100),
        batteryLevel: 85 + Math.random() * 5,
        batteryVoltage: 51.2 + Math.random(),
        temperature: 45 + Math.random() * 10,
        irradiance: 800 + Math.random() * 200,
        loadPower: 400 + Math.random() * 50,
        systemStatus: 'normal'
      }
    }, {
      onSuccess: () => {
        toast({ title: "Reading Simulated", description: "Injected new sensor data." });
        refetch();
      }
    });
  };

  const getMetricColor = (m: string) => {
    if (m === 'power') return 'hsl(var(--primary))';
    if (m === 'voltage' || m === 'battery') return 'hsl(var(--secondary))';
    if (m === 'current') return 'hsl(var(--chart-3))';
    if (m === 'temperature') return 'hsl(var(--destructive))';
    return 'hsl(var(--chart-5))';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" />
          Sensor Telemetry
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSimulate} disabled={createReading.isPending} className="border-border">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Inject Data
          </Button>
        </div>
      </div>

      {/* Main Graph */}
      <Card className="border-border bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Historical Telemetry</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-[140px] h-8 text-xs font-mono">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="power">Power Output</SelectItem>
                <SelectItem value="voltage">Array Voltage</SelectItem>
                <SelectItem value="current">Array Current</SelectItem>
                <SelectItem value="battery">Battery Level</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="irradiance">Irradiance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={hours} onValueChange={setHours}>
              <SelectTrigger className="w-[100px] h-8 text-xs font-mono">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last Hour</SelectItem>
                <SelectItem value="6">Last 6 Hours</SelectItem>
                <SelectItem value="24">Last 24 Hours</SelectItem>
                <SelectItem value="168">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[400px] w-full">
            {history && history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--app-font-mono)' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                    labelFormatter={(val) => new Date(val).toLocaleString()}
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="value" 
                    stroke={getMetricColor(metric)} 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4, fill: getMetricColor(metric), stroke: 'hsl(var(--background))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">NO DATA AVAILABLE</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid of full latest readings */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {latest && Object.entries(latest).map(([key, val]) => {
          if (['id', 'timestamp', 'systemStatus'].includes(key)) return null;
          return (
            <Card key={key} className="bg-card/40 border-border">
              <CardContent className="p-4">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="text-xl font-data font-bold text-foreground mt-1">
                  {typeof val === 'number' ? val.toFixed(2) : String(val)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
