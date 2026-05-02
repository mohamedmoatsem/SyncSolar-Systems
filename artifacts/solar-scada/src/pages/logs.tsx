import { useListLogs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Database, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Logs() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: logsResponse, isLoading } = useListLogs({
    page,
    limit
  }, {
    query: { keepPreviousData: true }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-6 w-6 text-secondary" />
        <h2 className="text-xl font-bold tracking-tight uppercase">System Data Logs</h2>
      </div>

      <Card className="border-border bg-card/80 flex-1 flex flex-col min-h-0">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4 py-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider">Raw Telemetry Table</CardTitle>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-muted-foreground">
              Total Records: {logsResponse?.total || 0}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 border-border"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="w-20 text-center">
                PG {page} / {logsResponse?.totalPages || 1}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 border-border"
                onClick={() => setPage(p => p + 1)}
                disabled={!logsResponse || page >= logsResponse.totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur z-10 shadow-sm border-b border-border">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-mono text-xs uppercase">Timestamp</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Volt (V)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Curr (A)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Pwr (W)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Batt (%)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Temp (°C)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Irr (W/m²)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-right">Load (W)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-data text-xs">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : logsResponse?.data?.length ? (
                logsResponse.data.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-muted/30">
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString(undefined, { 
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-right text-secondary">{log.voltage.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{log.current.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-primary">{log.power.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{log.batteryLevel.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{log.temperature.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{log.irradiance.toFixed(0)}</TableCell>
                    <TableCell className="text-right">{log.loadPower.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 border-border ${log.systemStatus === 'normal' ? 'text-muted-foreground' : 'text-destructive border-destructive/50'}`}>
                        {log.systemStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No logs found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
