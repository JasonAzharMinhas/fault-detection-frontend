// Mock data for Smart Factory system
// TODO: Replace with real API calls when backend is ready

export type MachineStatus = "healthy" | "warning" | "critical" | "maintenance";

export type ComponentType = "Bearing" | "Rotor" | "Shaft" | "Cooling Fan" | "Gearbox";

export interface Machine {
  id: number;
  name: string;
  status: MachineStatus;
  healthScore: number;
  lastUpdated: Date;
}

export interface Job {
  id: number;
  jobName: string;
  assignedMachine: number;
  status: "pending" | "running" | "completed" | "paused";
  priority: number;
}

export interface FaultLog {
  id: number;
  machineId: number;
  faultType: ComponentType;
  component: string;
  severity: "Low" | "Moderate" | "High" | "Critical";
  timestamp: Date;
  confidence?: number;
}

export const machines: Machine[] = [
  {
    id: 101,
    name: "CNC Milling Machine",
    status: "healthy",
    healthScore: 0.95,
    lastUpdated: new Date("2025-11-10T10:30:00"),
  },
  {
    id: 102,
    name: "Hydraulic Press",
    status: "warning",
    healthScore: 0.72,
    lastUpdated: new Date("2025-11-10T10:25:00"),
  },
  {
    id: 103,
    name: "Conveyor Motor Unit",
    status: "critical",
    healthScore: 0.45,
    lastUpdated: new Date("2025-11-10T10:28:00"),
  },
  {
    id: 104,
    name: "Cooling Fan Assembly",
    status: "healthy",
    healthScore: 0.88,
    lastUpdated: new Date("2025-11-10T10:32:00"),
  },
  {
    id: 105,
    name: "Gearbox Station",
    status: "warning",
    healthScore: 0.68,
    lastUpdated: new Date("2025-11-10T10:20:00"),
  },
];

export const jobs: Job[] = [
  { id: 1, jobName: "Production Batch A-101", assignedMachine: 101, status: "running", priority: 1 },
  { id: 2, jobName: "Precision Cutting B-205", assignedMachine: 102, status: "paused", priority: 2 },
  { id: 3, jobName: "Assembly Line C-330", assignedMachine: 103, status: "pending", priority: 3 },
  { id: 4, jobName: "Quality Check D-412", assignedMachine: 104, status: "running", priority: 1 },
  { id: 5, jobName: "Package Processing E-550", assignedMachine: 105, status: "running", priority: 2 },
  { id: 6, jobName: "Maintenance Task F-670", assignedMachine: 101, status: "pending", priority: 3 },
  { id: 7, jobName: "Inspection Round G-780", assignedMachine: 104, status: "completed", priority: 1 },
];

export const faultLogs: FaultLog[] = [
  {
    id: 1,
    machineId: 103,
    faultType: "Bearing",
    component: "Inner race wear",
    severity: "High",
    timestamp: new Date("2025-11-10T08:15:00"),
    confidence: 0.89,
  },
  {
    id: 2,
    machineId: 102,
    faultType: "Rotor",
    component: "Imbalance detected",
    severity: "Moderate",
    timestamp: new Date("2025-11-10T07:45:00"),
    confidence: 0.76,
  },
  {
    id: 3,
    machineId: 105,
    faultType: "Gearbox",
    component: "Tooth wear",
    severity: "Moderate",
    timestamp: new Date("2025-11-10T09:20:00"),
    confidence: 0.82,
  },
  {
    id: 4,
    machineId: 103,
    faultType: "Shaft",
    component: "Misalignment",
    severity: "Critical",
    timestamp: new Date("2025-11-10T10:05:00"),
    confidence: 0.91,
  },
  {
    id: 5,
    machineId: 102,
    faultType: "Cooling Fan",
    component: "Vibration anomaly",
    severity: "Low",
    timestamp: new Date("2025-11-10T06:30:00"),
    confidence: 0.68,
  },
  {
    id: 6,
    machineId: 105,
    faultType: "Bearing",
    component: "Outer race fault",
    severity: "Moderate",
    timestamp: new Date("2025-11-10T05:50:00"),
    confidence: 0.79,
  },
  {
    id: 7,
    machineId: 103,
    faultType: "Rotor",
    component: "Overheating",
    severity: "High",
    timestamp: new Date("2025-11-10T09:55:00"),
    confidence: 0.87,
  },
  {
    id: 8,
    machineId: 101,
    faultType: "Cooling Fan",
    component: "Performance degradation",
    severity: "Low",
    timestamp: new Date("2025-11-09T23:10:00"),
    confidence: 0.62,
  },
  {
    id: 9,
    machineId: 104,
    faultType: "Bearing",
    component: "Lubrication issue",
    severity: "Low",
    timestamp: new Date("2025-11-09T22:30:00"),
    confidence: 0.71,
  },
  {
    id: 10,
    machineId: 102,
    faultType: "Gearbox",
    component: "Noise anomaly",
    severity: "Moderate",
    timestamp: new Date("2025-11-10T08:40:00"),
    confidence: 0.74,
  },
];

// Simulated health history for charts
export const generateHealthHistory = (machineId: number, days: number = 7) => {
  const history = [];
  const currentMachine = machines.find(m => m.id === machineId);
  const baseHealth = currentMachine?.healthScore || 0.8;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate health trend
    const variance = (Math.random() - 0.5) * 0.15;
    const trend = i === 0 ? 0 : (days - i) * -0.02; // Gradual decline
    const health = Math.max(0.3, Math.min(1.0, baseHealth + variance + trend));
    
    history.push({
      date: date.toISOString().split('T')[0],
      health: parseFloat(health.toFixed(2)),
    });
  }
  
  return history;
};

// Simulated predict endpoint response
// TODO: integrate PyTorch model here
export const simulatePredict = (sensorData: { temperature: number; vibration: number; current: number }) => {
  const faultTypes: ComponentType[] = ["Bearing", "Rotor", "Shaft", "Cooling Fan", "Gearbox"];
  const locations = {
    Bearing: ["Inner race", "Outer race", "Ball element"],
    Rotor: ["Imbalance", "Eccentricity", "Winding"],
    Shaft: ["Misalignment", "Crack", "Bend"],
    "Cooling Fan": ["Blade damage", "Performance", "Vibration"],
    Gearbox: ["Tooth wear", "Lubrication", "Noise"],
  };
  
  const randomFault = faultTypes[Math.floor(Math.random() * faultTypes.length)];
  const randomLocation = locations[randomFault][Math.floor(Math.random() * locations[randomFault].length)];
  
  return {
    machine_id: "103",
    predicted_fault: randomFault,
    fault_location: randomLocation,
    severity: ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)],
    confidence: parseFloat((0.6 + Math.random() * 0.35).toFixed(2)),
  };
};

// Simulated job reassignment
// TODO: add MLflow tracking here
export const simulateSchedule = (machineId: number) => {
  const affectedJobs = jobs.filter(j => j.assignedMachine === machineId && j.status !== "completed");
  const healthyMachines = machines.filter(m => m.status === "healthy" && m.id !== machineId);
  
  const reassignments = affectedJobs.map((job, index) => {
    const newMachine = healthyMachines[index % healthyMachines.length];
    return {
      jobId: job.id,
      jobName: job.jobName,
      oldMachine: machineId,
      newMachine: newMachine.id,
      newMachineName: newMachine.name,
    };
  });
  
  return {
    success: true,
    reassignedCount: affectedJobs.length,
    reassignments,
  };
};
