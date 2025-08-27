import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Campaign, Lead } from "@shared/schema";

export function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  // Calculate analytics data
  const analytics = {
    totalCampaigns: campaigns.length,
    completedCampaigns: campaigns.filter((c: Campaign) => c.status === "completed").length,
    activeCampaigns: campaigns.filter((c: Campaign) => c.status === "running").length,
    averageLeadsPerCampaign: campaigns.length > 0 ? Math.round(leads.length / campaigns.length) : 0,
    topCategories: getTopCategories(leads),
    recentPerformance: getRecentPerformance(campaigns),
  };

  if (statsLoading || campaignsLoading || leadsLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Performance insights and business intelligence</p>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-48" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-campaigns">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <i className="fas fa-rocket text-primary text-xl"></i>
              </div>
              <Badge variant="secondary" className="text-xs">Total</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analytics.totalCampaigns}</p>
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-campaigns">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-chart-3/10 rounded-lg">
                <i className="fas fa-clock text-chart-3 text-xl"></i>
              </div>
              <Badge variant="secondary" className="text-xs">Active</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analytics.activeCampaigns}</p>
              <p className="text-sm text-muted-foreground">Active Campaigns</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-completion-rate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-chart-2/10 rounded-lg">
                <i className="fas fa-check-circle text-chart-2 text-xl"></i>
              </div>
              <Badge variant="secondary" className="text-xs">Rate</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {analytics.totalCampaigns > 0 
                  ? Math.round((analytics.completedCampaigns / analytics.totalCampaigns) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-leads">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-chart-1/10 rounded-lg">
                <i className="fas fa-users text-chart-1 text-xl"></i>
              </div>
              <Badge variant="secondary" className="text-xs">Avg</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analytics.averageLeadsPerCampaign}</p>
              <p className="text-sm text-muted-foreground">Avg. Leads/Campaign</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <Card data-testid="card-campaign-performance">
          <CardHeader>
            <CardTitle className="text-lg font-semibold font-serif">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns created yet. Start your first campaign to see performance data.
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign: Campaign, index: number) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.businessCategory} • {campaign.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={campaign.status === "completed" ? "default" : 
                                campaign.status === "running" ? "secondary" : "outline"}
                        className="text-xs mb-1"
                      >
                        {campaign.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {campaign.leadsFound || 0} leads
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Business Categories */}
        <Card data-testid="card-top-categories">
          <CardHeader>
            <CardTitle className="text-lg font-semibold font-serif">Top Business Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No lead data available yet. Generate leads to see category analysis.
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topCategories.map((category: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-foreground">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">{category.count}</span>
                      <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Generation Trends Chart Placeholder */}
        <Card className="lg:col-span-2" data-testid="card-trends-chart">
          <CardHeader>
            <CardTitle className="text-lg font-semibold font-serif">Lead Generation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container rounded-lg p-8 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-chart-line text-primary text-2xl"></i>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Interactive chart will be rendered here</p>
                <p className="text-xs text-muted-foreground">
                  Showing lead generation trends over time with interactive data visualization
                </p>
              </div>
            </div>
            
            {/* Chart Legend */}
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Generated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Validated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Converted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getTopCategories(leads: any[]) {
  const categoryCount: { [key: string]: number } = {};
  const total = leads.length;
  
  leads.forEach(lead => {
    if (lead.category) {
      categoryCount[lead.category] = (categoryCount[lead.category] || 0) + 1;
    }
  });
  
  return Object.entries(categoryCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getRecentPerformance(campaigns: any[]) {
  return campaigns
    .filter(c => c.status === "completed")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
}
