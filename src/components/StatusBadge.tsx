import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, XCircle, Wrench } from "lucide-react";

type MachineStatus = "healthy" | "warning" | "critical" | "maintenance";

interface StatusBadgeProps {
  status: MachineStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const StatusBadge = ({ status, showIcon = true, size = "md" }: StatusBadgeProps) => {
  const config = {
    healthy: {
      className: "bg-status-healthy/10 text-status-healthy border-status-healthy/30",
      icon: Activity,
      label: "Healthy",
    },
    warning: {
      className: "bg-status-warning/10 text-status-warning border-status-warning/30",
      icon: AlertTriangle,
      label: "Warning",
    },
    critical: {
      className: "bg-status-faulty/10 text-status-faulty border-status-faulty/30",
      icon: XCircle,
      label: "Critical",
    },
    maintenance: {
      className: "bg-muted text-muted-foreground border-border",
      icon: Wrench,
      label: "Maintenance",
    },
  };

  const { className, icon: Icon, label } = config[status];
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        className,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{label}</span>
    </div>
  );
};

export default StatusBadge;
