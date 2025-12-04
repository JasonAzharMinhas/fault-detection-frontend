import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Pause, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { useMachines } from "@/hooks/useMachines";
import { useJobs } from "@/hooks/useJobs";
import type { Database } from "@/integrations/supabase/types";
import AddJobDialog from "@/components/AddJobDialog";

type MachineStatus = Database["public"]["Enums"]["machine_status"];

const JobScheduler = () => {
  const { toast } = useToast();
  const { machines, isLoading: machinesLoading } = useMachines();
  const { jobs, isLoading: jobsLoading, updateJob } = useJobs();

  const handleReassign = (machineId: number) => {
    const unhealthyMachineJobs = jobs.filter(
      (j) => j.machine_id === machineId && (j.status === "running" || j.status === "pending")
    );

    if (unhealthyMachineJobs.length === 0) {
      toast({
        title: "No Jobs to Reassign",
        description: "This machine has no active jobs.",
      });
      return;
    }

    const healthyMachines = machines.filter((m) => m.status === "healthy" && m.id !== machineId);

    if (healthyMachines.length === 0) {
      toast({
        title: "No Healthy Machines Available",
        description: "Cannot reassign jobs - no healthy machines available.",
        variant: "destructive",
      });
      return;
    }

    let reassignedCount = 0;
    unhealthyMachineJobs.forEach((job, index) => {
      const targetMachine = healthyMachines[index % healthyMachines.length];
      updateJob({ id: job.id, updates: { machine_id: targetMachine.id } });
      reassignedCount++;
    });

    toast({
      title: "Jobs Reassigned",
      description: `${reassignedCount} job(s) reassigned to healthy machines.`,
    });
  };

  const statusConfig = {
    pending: { icon: Clock, className: "text-muted-foreground", label: "Pending" },
    running: { icon: CheckCircle, className: "text-status-healthy", label: "Running" },
    completed: { icon: CheckCircle, className: "text-primary", label: "Completed" },
    paused: { icon: Pause, className: "text-status-warning", label: "Paused" },
  };

  const priorityMap: Record<string, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const priorityColors: Record<number, string> = {
    1: "text-status-faulty font-bold",
    2: "text-status-warning font-semibold",
    3: "text-muted-foreground font-medium",
  };

  const unhealthyMachines = machines.filter((m) => m.status === "warning" || m.status === "critical");

  if (machinesLoading || jobsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Scheduler</h1>
          <p className="text-muted-foreground mt-1">Manage and reassign production jobs</p>
        </div>
        <AddJobDialog />
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-healthy">
              {jobs.filter((j) => j.status === "running").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {jobs.filter((j) => j.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {jobs.filter((j) => j.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Jobs</CardTitle>
          <CardDescription>View and manage all scheduled jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Job ID</th>
                  <th className="text-left p-2 font-medium">Job Name</th>
                  <th className="text-left p-2 font-medium">Assigned Machine</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const machine = machines.find((m) => m.id === job.machine_id);
                  const statusInfo = statusConfig[job.status as keyof typeof statusConfig];
                  const StatusIcon = statusInfo?.icon;

                  return (
                    <tr key={job.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{job.id}</td>
                      <td className="p-2 font-medium">{job.name}</td>
                      <td className="p-2">
                        {machine ? (
                          <Link to={`/machine/${machine.id}`} className="hover:underline">
                            <div className="flex items-center gap-2">
                              <span>{machine.name}</span>
                              <StatusBadge status={machine.status as MachineStatus} showIcon={false} size="sm" />
                            </div>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className={`flex items-center gap-1.5 ${statusInfo?.className}`}>
                          {StatusIcon && <StatusIcon className="h-4 w-4" />}
                          <span>{statusInfo?.label}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={priorityColors[priorityMap[job.priority]]}>
                          {job.priority.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {unhealthyMachines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
            <CardDescription>Reassign jobs from unhealthy machines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unhealthyMachines.map((machine) => {
                const activeJobs = jobs.filter(
                  (j) => j.machine_id === machine.id && (j.status === "running" || j.status === "pending")
                );

                return (
                  <Card key={machine.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Link to={`/machine/${machine.id}`} className="hover:underline">
                          <CardTitle className="text-base">{machine.name}</CardTitle>
                        </Link>
                        <StatusBadge status={machine.status as MachineStatus} size="sm" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Active Jobs: <span className="font-semibold text-foreground">{activeJobs.length}</span>
                      </p>
                      <Button
                        onClick={() => handleReassign(machine.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={activeJobs.length === 0}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reassign All Jobs
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobScheduler;
