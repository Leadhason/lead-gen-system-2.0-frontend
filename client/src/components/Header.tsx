import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm" 
          className="lg:hidden p-2"
          onClick={onSidebarToggle}
          data-testid="button-sidebar-toggle"
        >
          <i className="fas fa-bars text-foreground"></i>
        </Button>
        
        <div className="relative hidden sm:block">
          <Input
            type="search"
            placeholder="Search leads, campaigns..."
            className="w-64 pl-10"
            data-testid="input-search"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"} text-foreground`}></i>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          data-testid="button-notifications"
        >
          <i className="fas fa-bell text-foreground"></i>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 p-2"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-primary-foreground text-sm"></i>
          </div>
          <i className="fas fa-chevron-down text-muted-foreground hidden sm:block"></i>
        </Button>
      </div>
    </header>
  );
}
