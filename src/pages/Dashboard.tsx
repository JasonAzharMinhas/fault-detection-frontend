import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Activity, AlertTriangle, Factory } from "lucide-react";
import { Link } from "react-router-dom";
import HealthScore from "../components/HealthScore";
import { useMachines } from "@/hooks/useMachines";
import { useFaultLogs } from "@/hooks/useFaultLogs";
import Notifications from "../components/Notifications";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const Dashboard = () => {
  const { machines, isLoading: machinesLoading } = useMachines();
  const { faultLogs, isLoading: faultLogsLoading } = useFaultLogs();

  if (machinesLoading || faultLogsLoading) {
    return <div className="container mx-auto p-6 text-center">Loading dashboard...</div>;
  }

  const healthyCount = machines.filter((m) => m.status === "healthy").length;
  const warningCount = machines.filter((m) => m.status === "warning").length;
  const criticalCount = machines.filter((m) => m.status === "critical").length;

  const localRaw = JSON.parse(localStorage.getItem("fault_logs") || "[]") as any[];
  const merged = [...(localRaw || []), ...(faultLogs || [])];

  const distribution: Record<string, number> = {};
  merged.forEach((f: any) => {
    const key = f.fault_type || f.fault || "Unknown";
    distribution[key] = (distribution[key] || 0) + 1;
  });
  const chartData = Object.entries(distribution).map(([name, value]) => ({ name, value }));

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const recentFaults = merged
    .sort((a: any, b: any) => new Date(b.detected_at || b.ts || b.created_at).getTime() - new Date(a.detected_at || a.ts || a.created_at).getTime())
    .slice(0, 5);

  const notifs = JSON.parse(localStorage.getItem("smartfactory_notifications") || "[]");
  const unread = (notifs || []).filter((n: any) => !n.read).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Factory Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time machine health and fault monitoring</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">Notifications</div>
          <div className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{unread}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between"><CardTitle>Total Machines</CardTitle><Factory className="h-4 w-4" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{machines.length}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between"><CardTitle>Healthy</CardTitle><Activity className="h-4 w-4 text-green-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{healthyCount}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between"><CardTitle>Warning</CardTitle><AlertTriangle className="h-4 w-4 text-yellow-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{warningCount}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between"><CardTitle>Critical</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{criticalCount}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Machine Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {machines.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-6">No machines found.</div>
            ) : (
              machines.map((m: any) => (
                <Link to={`/machine/${m.id}`} key={m.id}>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                    <div>
                      <div className="font-medium">Machine {m.id}</div>
                      <div className="text-xs text-gray-500">{m.name}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div style={{ width: 120 }}>
                        <HealthScore temperature={m.temperature ?? 0} vibration={m.vibration ?? 0} load={m.current_load ?? 0} />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{m.health_score ?? "-" }%</div>
                        <div className="text-xs text-gray-500">Health</div>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fault Distribution</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No faults detected</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" outerRadius={90} label>
                    {chartData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Fault Logs</CardTitle></CardHeader>
        <CardContent>
          {recentFaults.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No recent faults</div>
          ) : (
            recentFaults.map((f: any) => (
              <div key={f.id || JSON.stringify(f)} className="flex justify-between p-3 border rounded mb-2">
                <div>
                  <div className="font-medium">{f.fault_type || f.fault}</div>
                  <div className="text-xs text-gray-500">Machine {f.machine_id ?? f.machine_name}</div>
                </div>
                <div className="text-xs text-gray-500">{format(new Date(f.detected_at || f.ts || f.created_at), "MMM d, HH:mm")}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
