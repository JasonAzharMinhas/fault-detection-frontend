import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMachines } from "@/hooks/useMachines";
import AddMachineDialog from "@/components/AddMachineDialog";

const MachineList = () => {
  const { machines, isLoading } = useMachines();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading machines...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Machine Monitoring</h1>
          <p className="text-muted-foreground mt-1">Detailed view of all factory machines</p>
        </div>
        <AddMachineDialog />
      </div>

      {machines.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No machines found. Add machines to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => {
            const healthPercent = machine.health_score;
            const trend = machine.status === "healthy" ? "up" : machine.status === "critical" ? "down" : "stable";
          
          return (
            <Card key={machine.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Machine {machine.id}</CardTitle>
                    <CardDescription>{machine.name}</CardDescription>
                  </div>
                  <StatusBadge status={machine.status} showIcon={false} size="sm" />
                </div>
              </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Health Score</span>
                  <div className="flex items-center gap-1">
                    {trend === "up" && <TrendingUp className="h-4 w-4 text-status-healthy" />}
                    {trend === "down" && <TrendingDown className="h-4 w-4 text-status-faulty" />}
                    <span className="text-lg font-bold">{healthPercent}%</span>
                  </div>
                </div>
                <Progress 
                  value={healthPercent} 
                  className="h-2"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Location: {machine.location}
              </div>

              <Link to={`/machine/${machine.id}`}>
                <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                  <span className="font-medium">View Details</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </CardContent>
          </Card>
        );
      })}
        </div>
      )}
    </div>
  );
};

export default MachineList;
