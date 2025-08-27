import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      campaignComplete: true,
      weeklyReports: false,
      systemUpdates: true,
    },
    scraping: {
      defaultMode: "standard",
      defaultDelay: 1.5,
      defaultPageLimit: 50,
      autoValidation: true,
    },
    export: {
      defaultFormat: "csv",
      includeMetadata: true,
      compressFiles: false,
    },
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updateScrapingSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      scraping: {
        ...prev.scraping,
        [key]: value,
      },
    }));
  };

  const updateExportSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      export: {
        ...prev.export,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configuration</p>
      </div>

      {/* General Settings */}
      <Card data-testid="card-general-settings">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-serif">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Theme</Label>
              <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Select value={theme} onValueChange={(value: "light" | "dark") => setTheme(value)}>
              <SelectTrigger className="w-32" data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input 
                  id="display-name" 
                  defaultValue="John Smith" 
                  data-testid="input-display-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="admin@company.com" 
                  disabled 
                  data-testid="input-email"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card data-testid="card-notification-settings">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-serif">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Email Alerts</Label>
              <p className="text-xs text-muted-foreground">Receive email notifications for important events</p>
            </div>
            <Switch
              checked={settings.notifications.emailAlerts}
              onCheckedChange={(checked) => updateNotificationSetting("emailAlerts", checked)}
              data-testid="switch-email-alerts"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Campaign Completion</Label>
              <p className="text-xs text-muted-foreground">Get notified when campaigns finish</p>
            </div>
            <Switch
              checked={settings.notifications.campaignComplete}
              onCheckedChange={(checked) => updateNotificationSetting("campaignComplete", checked)}
              data-testid="switch-campaign-complete"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Weekly Reports</Label>
              <p className="text-xs text-muted-foreground">Receive weekly performance summaries</p>
            </div>
            <Switch
              checked={settings.notifications.weeklyReports}
              onCheckedChange={(checked) => updateNotificationSetting("weeklyReports", checked)}
              data-testid="switch-weekly-reports"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">System Updates</Label>
              <p className="text-xs text-muted-foreground">Get notified about system updates and maintenance</p>
            </div>
            <Switch
              checked={settings.notifications.systemUpdates}
              onCheckedChange={(checked) => updateNotificationSetting("systemUpdates", checked)}
              data-testid="switch-system-updates"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scraping Defaults */}
      <Card data-testid="card-scraping-settings">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-serif">Default Scraping Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-mode">Default Scraping Mode</Label>
              <Select 
                value={settings.scraping.defaultMode} 
                onValueChange={(value) => updateScrapingSetting("defaultMode", value)}
              >
                <SelectTrigger data-testid="select-default-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="thorough">Thorough</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-delay">Default Delay (seconds)</Label>
              <Input
                id="default-delay"
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={settings.scraping.defaultDelay}
                onChange={(e) => updateScrapingSetting("defaultDelay", parseFloat(e.target.value))}
                data-testid="input-default-delay"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-page-limit">Default Page Limit</Label>
              <Input
                id="default-page-limit"
                type="number"
                min="1"
                max="200"
                value={settings.scraping.defaultPageLimit}
                onChange={(e) => updateScrapingSetting("defaultPageLimit", parseInt(e.target.value))}
                data-testid="input-default-page-limit"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Auto-validation</Label>
                <p className="text-xs text-muted-foreground">Automatically validate leads</p>
              </div>
              <Switch
                checked={settings.scraping.autoValidation}
                onCheckedChange={(checked) => updateScrapingSetting("autoValidation", checked)}
                data-testid="switch-auto-validation"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card data-testid="card-export-settings">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-serif">Export Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-format">Default Export Format</Label>
              <Select 
                value={settings.export.defaultFormat} 
                onValueChange={(value) => updateExportSetting("defaultFormat", value)}
              >
                <SelectTrigger data-testid="select-default-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Include Metadata</Label>
                  <p className="text-xs text-muted-foreground">Add creation date and campaign info</p>
                </div>
                <Switch
                  checked={settings.export.includeMetadata}
                  onCheckedChange={(checked) => updateExportSetting("includeMetadata", checked)}
                  data-testid="switch-include-metadata"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Compress Files</Label>
                  <p className="text-xs text-muted-foreground">Automatically zip large exports</p>
                </div>
                <Switch
                  checked={settings.export.compressFiles}
                  onCheckedChange={(checked) => updateExportSetting("compressFiles", checked)}
                  data-testid="switch-compress-files"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API & Integration */}
      <Card data-testid="card-api-settings">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-serif">API & Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex space-x-2">
              <Input 
                id="api-key" 
                type="password" 
                value="sk-xxxxxxxxxxxxxxxxxxxxxxxx" 
                readOnly 
                data-testid="input-api-key"
              />
              <Button variant="outline" size="sm" data-testid="button-regenerate-api-key">
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this API key to integrate with external services
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input 
              placeholder="https://your-app.com/webhook" 
              data-testid="input-webhook-url"
            />
            <p className="text-xs text-muted-foreground">
              Receive real-time notifications via webhook
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} data-testid="button-save-settings">
          <i className="fas fa-save mr-2"></i>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
