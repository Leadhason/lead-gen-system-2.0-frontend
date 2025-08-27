import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  businessCategory: z.string().min(1, "Business category is required"),
  location: z.string().min(1, "Location is required"),
  radius: z.coerce.number().min(1).max(100),
  scrapingMode: z.enum(["fast", "standard", "thorough", "debug"]),
  pageLimit: z.coerce.number().min(1).max(200).optional(),
  delay: z.coerce.number().min(0.5).max(10).optional(),
});

type CampaignForm = z.infer<typeof campaignSchema>;

export function LeadGeneration() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const form = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      businessCategory: "",
      location: "",
      radius: 25,
      scrapingMode: "standard",
      pageLimit: 50,
      delay: 1.5,
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignForm) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: (campaign) => {
      toast({
        title: "Campaign Created",
        description: "Your lead generation campaign has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setCurrentCampaign(campaign);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/start`);
      return response.json();
    },
    onSuccess: () => {
      setIsProcessing(true);
      toast({
        title: "Campaign Started",
        description: "Lead generation has started. You can monitor progress in real-time.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle WebSocket messages for real-time updates
  React.useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === "scraping_progress") {
        setCurrentCampaign((prev: any) => prev ? {
          ...prev,
          progress: lastMessage.progress,
          totalPages: lastMessage.totalPages,
          leadsFound: lastMessage.leadsFound,
        } : null);
      } else if (lastMessage.type === "scraping_completed") {
        setIsProcessing(false);
        toast({
          title: "Campaign Completed",
          description: "Lead generation has finished successfully!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      }
    }
  }, [lastMessage, toast, queryClient]);

  const onSubmit = (data: CampaignForm) => {
    createCampaignMutation.mutate(data);
  };

  const handleStartScraping = () => {
    if (currentCampaign) {
      startCampaignMutation.mutate(currentCampaign.id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Query Builder */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold font-serif">Lead Generation Query Builder</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Configure your lead generation parameters</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">Draft</Badge>
                <Button variant="ghost" size="sm" data-testid="button-save-query">
                  <i className="fas fa-save text-muted-foreground"></i>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="Enter campaign name"
                  {...form.register("name")}
                  data-testid="input-campaign-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Business Category */}
              <div className="space-y-2">
                <Label htmlFor="businessCategory">Business Category</Label>
                <Select onValueChange={(value) => form.setValue("businessCategory", value)}>
                  <SelectTrigger data-testid="select-business-category">
                    <SelectValue placeholder="Select business category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurants">Restaurants & Food Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                    <SelectItem value="professional">Professional Services</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="realestate">Real Estate</SelectItem>
                    <SelectItem value="automotive">Automotive Services</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.businessCategory && (
                  <p className="text-sm text-destructive">{form.formState.errors.businessCategory.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State or ZIP code"
                    {...form.register("location")}
                    data-testid="input-location"
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (miles)</Label>
                  <Select onValueChange={(value) => form.setValue("radius", parseInt(value))}>
                    <SelectTrigger data-testid="select-radius">
                      <SelectValue placeholder="25 miles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scraping Mode */}
              <div className="space-y-3">
                <Label>Scraping Mode</Label>
                <RadioGroup
                  defaultValue="standard"
                  onValueChange={(value) => form.setValue("scrapingMode", value as any)}
                  className="flex flex-wrap gap-4"
                  data-testid="radio-scraping-mode"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fast" id="fast" />
                    <Label htmlFor="fast">Fast</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thorough" id="thorough" />
                    <Label htmlFor="thorough">Thorough</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debug" id="debug" />
                    <Label htmlFor="debug">Debug</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Advanced Options */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex items-center space-x-2 text-sm p-0"
                    data-testid="button-toggle-advanced"
                  >
                    <i className={`fas fa-chevron-${showAdvanced ? 'down' : 'right'} transform transition-transform`}></i>
                    <span>Advanced Options</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4 pl-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pageLimit">Page Limit</Label>
                      <Input
                        id="pageLimit"
                        type="number"
                        min="1"
                        max="200"
                        {...form.register("pageLimit", { valueAsNumber: true })}
                        data-testid="input-page-limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delay">Delay (seconds)</Label>
                      <Input
                        id="delay"
                        type="number"
                        min="0.5"
                        max="10"
                        step="0.5"
                        {...form.register("delay", { valueAsNumber: true })}
                        data-testid="input-delay"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createCampaignMutation.isPending}
                  data-testid="button-create-campaign"
                >
                  <i className="fas fa-save mr-2"></i>
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
                
                {currentCampaign && (
                  <Button
                    type="button"
                    onClick={handleStartScraping}
                    disabled={isProcessing || startCampaignMutation.isPending}
                    data-testid="button-start-scraping"
                  >
                    <i className="fas fa-play mr-2"></i>
                    {startCampaignMutation.isPending ? "Starting..." : "Start Scraping"}
                  </Button>
                )}
                
                <Button type="button" variant="outline" data-testid="button-batch-upload">
                  <i className="fas fa-upload mr-2"></i>Batch Upload
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Monitor */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold font-serif">Real-time Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div className="p-4 bg-accent/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Current Status</span>
                <Badge variant={isProcessing ? "default" : "secondary"} className="text-xs">
                  {isProcessing ? "Running" : "Ready"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isProcessing 
                  ? "Campaign is running, monitoring progress..." 
                  : "System ready for new scraping task"
                }
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Progress</span>
                <span className="text-sm text-muted-foreground" data-testid="text-progress-percentage">
                  {currentCampaign?.progress || 0}%
                </span>
              </div>
              <Progress value={currentCampaign?.progress || 0} className="w-full" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-lg font-bold text-foreground" data-testid="text-pages-scraped">
                  {currentCampaign?.totalPages || 0}
                </p>
                <p className="text-xs text-muted-foreground">Pages Scraped</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-lg font-bold text-foreground" data-testid="text-leads-found">
                  {currentCampaign?.leadsFound || 0}
                </p>
                <p className="text-xs text-muted-foreground">Leads Found</p>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Recent Activity</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto" data-testid="activity-feed">
                {isProcessing ? (
                  <>
                    <p className="text-xs text-muted-foreground">Scraping in progress...</p>
                    <p className="text-xs text-muted-foreground">Processing page {currentCampaign?.totalPages || 0}</p>
                    <p className="text-xs text-muted-foreground">Found {currentCampaign?.leadsFound || 0} leads so far</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">System initialized</p>
                    <p className="text-xs text-muted-foreground">Ready for new task...</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
