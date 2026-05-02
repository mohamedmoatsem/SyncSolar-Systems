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

  const { data: logsResponse, isLoading } = useListLogs(
    { page, limit },
    { query: { keepPreviousData: true } }
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
        <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase">System Data Logs</h2>
      </div>

      <Card className="border-border bg-card/80 flex-1 flex flex-col min-h-0">
        <CardHeader className="border-b border-border py-3 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Raw Telemetry Table</CardTitle>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-muted-foreground">
                {logsResponse?.total || 0} records
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 border-border"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="w-16 text-center">
                  {page} / {logsResponse?.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 border-border"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!logsResponse || page >= logsResponse.totalPages || isLoading}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur z-10 shadow-sm border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-mono text-[10px] uppercase whitespace-nowrap">Timestamp</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right whitespace-nowrap">V (V)</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right whitespace-nowrap">A (A)</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right whitespace-nowrap">W (W)</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right whitespace-nowrap">Batt%</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right whitespace-nowrap">°C</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right whitespace-nowrap hidden sm:table-cell">Irr</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right whitespace-nowrap hidden sm:table-cell">Load</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-center whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-data text-xs">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : logsResponse?.data?.length ? (
                  logsResponse.data.map((log) => (
                    <TableRow key={log.id} className="border-border hover:bg-muted/30">
                      <TableCell className="text-muted-foreground whitespace-nowrap text-[10px] sm:text-xs">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right text-secondary">{log.voltage.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{log.current.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-primary">{log.power.toFixed(0)}</TableCell>
                      <TableCell className="text-right">{log.batteryLevel.toFixed(0)}</TableCell>
                      <TableCell className="text-right">{log.temperature.toFixed(0)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{log.irradiance.toFixed(0)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{log.loadPower.toFixed(0)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1 py-0 border-border ${
                            log.systemStatus === 'normal'
                              ? 'text-muted-foreground'
                              : 'text-destructive border-destructive/50'
                          }`}
                        >
                          {log.systemStatus === 'normal' ? 'OK' : log.systemStatus.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      No logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
