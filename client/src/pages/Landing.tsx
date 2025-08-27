import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <i className="fas fa-chart-line text-primary-foreground text-2xl"></i>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold font-serif text-foreground">LeadGen Pro 2.0</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Executive Dashboard for Lead Generation
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Comprehensive business intelligence platform for lead generation, 
                real-time monitoring, and data management.
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-accent rounded-lg">
                  <i className="fas fa-search text-primary mb-2 block"></i>
                  <span className="text-foreground">Advanced Scraping</span>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <i className="fas fa-chart-bar text-primary mb-2 block"></i>
                  <span className="text-foreground">Real-time Analytics</span>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <i className="fas fa-table text-primary mb-2 block"></i>
                  <span className="text-foreground">Data Management</span>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <i className="fas fa-download text-primary mb-2 block"></i>
                  <span className="text-foreground">Export Tools</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full"
              data-testid="button-login"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In to Get Started
            </Button>

            <p className="text-xs text-muted-foreground">
              Professional lead generation platform for business intelligence
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
