import { Link, useLocation } from "react-router-dom";
import { Factory, LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const links = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/machines", icon: Factory, label: "Machines" },
    { to: "/jobs", icon: ClipboardList, label: "Job Scheduler" },
  ];

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Factory className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Smart Factory</h1>
              <p className="text-xs text-muted-foreground">Fault Localization & Scheduler</p>
            </div>
          </div>
          
          <div className="flex gap-1 items-center">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
