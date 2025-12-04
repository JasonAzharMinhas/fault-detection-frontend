import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Activity, AlertTriangle, Factory } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMachines } from "@/hooks/useMachines";
import { useFaultLogs } from "@/hooks/useFaultLogs";
import { format } from "date-fns";

const Dashboard = () => {
  const { machines, isLoading: machinesLoading } = useMachines();
  const { faultLogs, isLoading: faultLogsLoading } = useFaultLogs();

  if (machinesLoading || faultLogsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  // Calculate statistics
  const healthyCount = machines.filter(m => m.status === "healthy").length;
  const warningCount = machines.filter(m => m.status === "warning").length;
  const criticalCount = machines.filter(m => m.status === "critical").length;

  // Fault distribution data
  const faultDistribution = faultLogs.reduce((acc, log) => {
    acc[log.fault_type] = (acc[log.fault_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(faultDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // Recent faults (last 5)
  const recentFaults = [...faultLogs]
    .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Factory Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time machine health and fault monitoring</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{machines.length}</div>
          </CardContent>
        </Card>

        <Card className="border-status-healthy/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <Activity className="h-4 w-4 text-status-healthy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-healthy">{healthyCount}</div>
          </CardContent>
        </Card>

        <Card className="border-status-warning/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{warningCount}</div>
          </CardContent>
        </Card>

        <Card className="border-status-faulty/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-faulty" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-faulty">{criticalCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Machines Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Machine Status</CardTitle>
            <CardDescription>Current health status of all machines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {machines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No machines found. Add machines to get started.
              </p>
            ) : (
              machines.map((machine) => (
                <Link key={machine.id} to={`/machine/${machine.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div>
                      <div className="font-medium text-foreground">Machine {machine.id}</div>
                      <div className="text-sm text-muted-foreground">{machine.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{machine.health_score}%</div>
                        <div className="text-xs text-muted-foreground">Health</div>
                      </div>
                      <StatusBadge status={machine.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Fault Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fault Distribution</CardTitle>
            <CardDescription>Breakdown of detected fault types</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                No fault data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Fault Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Fault Logs</CardTitle>
          <CardDescription>Latest detected faults across all machines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentFaults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No faults detected
              </p>
            ) : (
              recentFaults.map((fault) => {
                const machine = machines.find(m => m.id === fault.machine_id);
                const severityColor = {
                  low: "text-muted-foreground",
                  medium: "text-status-warning",
                  high: "text-status-warning",
                  critical: "text-status-faulty",
                }[fault.severity];

                return (
                  <div 
                    key={fault.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${severityColor}`} />
                        <span className="font-medium text-foreground">{fault.fault_type}</span>
                        <span className={`text-xs font-medium ${severityColor} uppercase`}>
                          {fault.severity}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Machine {fault.machine_id} - {machine?.name || 'Unknown'} • {fault.component}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(fault.detected_at), "MMM d, HH:mm")}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
