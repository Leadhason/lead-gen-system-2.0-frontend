import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { path: "/lead-generation", label: "Lead Generation", icon: "fas fa-search" },
  { path: "/results", label: "Results & Data", icon: "fas fa-table" },
  { path: "/analytics", label: "Analytics", icon: "fas fa-chart-bar" },
  { path: "/files", label: "File Management", icon: "fas fa-folder" },
  { path: "/settings", label: "Settings", icon: "fas fa-cog" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 fixed lg:relative z-30 h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-primary-foreground text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-foreground">LeadGen Pro</h1>
              <p className="text-xs text-muted-foreground">Version 2.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.path || (item.path === "/dashboard" && location === "/");
              
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <i className={`${item.icon} w-5 h-5`}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <i className="fas fa-user text-muted-foreground"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">Logged In</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
