import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: recentLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  const statsCards = [
    {
      title: "Total Leads Generated",
      value: stats?.totalLeads || 0,
      change: "+12.5%",
      icon: "fas fa-users",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Validated Leads", 
      value: stats?.validatedLeads || 0,
      change: "+8.2%",
      icon: "fas fa-check-circle",
      color: "bg-chart-1/10 text-chart-1",
    },
    {
      title: "Active Campaigns",
      value: stats?.activeCampaigns || 0,
      change: "Active",
      icon: "fas fa-clock",
      color: "bg-chart-3/10 text-chart-3",
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      change: "+3.1%",
      icon: "fas fa-percentage", 
      color: "bg-chart-5/10 text-chart-5",
    },
  ];

  if (statsLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Executive Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive lead generation and business intelligence platform</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button data-testid="button-new-campaign">
            <i className="fas fa-plus mr-2"></i>New Campaign
          </Button>
          <Button variant="outline" data-testid="button-export">
            <i className="fas fa-download mr-2"></i>Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <i className={`${card.icon} text-xl`}></i>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {card.change}
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid={`text-stat-value-${index}`}>
                  {card.value}
                </p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold font-serif">Recent Results</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" data-testid="button-filter">
                <i className="fas fa-filter text-muted-foreground"></i>
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-download-results">
                <i className="fas fa-download text-muted-foreground"></i>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading recent leads...</div>
          ) : !recentLeads || recentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found. Start a new campaign to generate leads.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-muted-foreground font-medium">Business Name</th>
                    <th className="pb-3 text-muted-foreground font-medium">Category</th>
                    <th className="pb-3 text-muted-foreground font-medium">Location</th>
                    <th className="pb-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.slice(0, 5).map((lead: any, index: number) => (
                    <tr key={lead.id} className="border-b border-border/50" data-testid={`row-lead-${index}`}>
                      <td className="py-3 text-foreground font-medium">{lead.businessName}</td>
                      <td className="py-3 text-muted-foreground">{lead.category || "N/A"}</td>
                      <td className="py-3 text-muted-foreground">{`${lead.city || "N/A"}, ${lead.state || "N/A"}`}</td>
                      <td className="py-3">
                        <Badge 
                          variant={lead.isValidated ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {lead.isValidated ? "Validated" : "Pending"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {recentLeads && recentLeads.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(5, recentLeads.length)} of {recentLeads.length} results
              </p>
              <Button variant="link" className="text-sm">
                View All Results →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
