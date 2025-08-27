import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";

export function Results() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lead Updated",
        description: "Lead information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setSelectedLead(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.category && lead.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "validated" && lead.isValidated) ||
                         (filterStatus === "pending" && !lead.isValidated);
    
    return matchesSearch && matchesFilter;
  });

  const handleUpdateLead = (updates: any) => {
    if (selectedLead) {
      updateLeadMutation.mutate({ id: selectedLead.id, updates });
    }
  };

  const handleExport = () => {
    // Simple CSV export
    const csvHeaders = ["Business Name", "Category", "Phone", "Email", "Website", "Address", "City", "State", "Status"];
    const csvData = filteredLeads.map((lead: Lead) => [
      lead.businessName,
      lead.category || "",
      lead.phone || "",
      lead.email || "",
      lead.website || "",
      lead.address || "",
      lead.city || "",
      lead.state || "",
      lead.isValidated ? "Validated" : "Pending"
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map((cell: any) => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Leads have been exported to CSV file.",
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading results...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Results & Data</h1>
          <p className="text-muted-foreground">Manage and analyze your generated leads</p>
        </div>
        <Button onClick={handleExport} data-testid="button-export-results">
          <i className="fas fa-download mr-2"></i>Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Leads</Label>
              <Input
                id="search"
                placeholder="Search by business name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-leads"
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="validated">Validated Only</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lead Results ({filteredLeads.length})</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" data-testid="button-filter-options">
                <i className="fas fa-filter text-muted-foreground"></i>
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-sort-options">
                <i className="fas fa-sort text-muted-foreground"></i>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-muted-foreground font-medium">Business Name</th>
                    <th className="pb-3 text-muted-foreground font-medium">Category</th>
                    <th className="pb-3 text-muted-foreground font-medium">Contact</th>
                    <th className="pb-3 text-muted-foreground font-medium">Location</th>
                    <th className="pb-3 text-muted-foreground font-medium">Status</th>
                    <th className="pb-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead: any, index: number) => (
                    <tr key={lead.id} className="border-b border-border/50" data-testid={`row-lead-${index}`}>
                      <td className="py-3">
                        <div>
                          <p className="text-foreground font-medium">{lead.businessName}</p>
                          {lead.rating && (
                            <p className="text-xs text-muted-foreground">
                              ⭐ {lead.rating} ({lead.reviewCount || 0} reviews)
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{lead.category || "N/A"}</td>
                      <td className="py-3">
                        <div className="space-y-1">
                          {lead.phone && (
                            <p className="text-xs text-foreground">{lead.phone}</p>
                          )}
                          {lead.email && (
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {`${lead.city || "N/A"}, ${lead.state || "N/A"}`}
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          <Badge 
                            variant={lead.isValidated ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {lead.isValidated ? "Validated" : "Pending"}
                          </Badge>
                          {lead.contactStatus && lead.contactStatus !== "not_contacted" && (
                            <Badge variant="outline" className="text-xs">
                              {lead.contactStatus.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLead(lead)}
                                data-testid={`button-edit-lead-${index}`}
                              >
                                <i className="fas fa-edit text-muted-foreground"></i>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Lead</DialogTitle>
                              </DialogHeader>
                              <EditLeadForm 
                                lead={selectedLead} 
                                onUpdate={handleUpdateLead}
                                isLoading={updateLeadMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          {lead.website && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(lead.website, "_blank")}
                              data-testid={`button-visit-website-${index}`}
                            >
                              <i className="fas fa-external-link-alt text-muted-foreground"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditLeadForm({ lead, onUpdate, isLoading }: { lead: any; onUpdate: (updates: any) => void; isLoading: boolean }) {
  const [notes, setNotes] = useState(lead?.notes || "");
  const [tags, setTags] = useState(lead?.tags || "");
  const [contactStatus, setContactStatus] = useState(lead?.contactStatus || "not_contacted");

  const handleSubmit = () => {
    onUpdate({
      notes,
      tags,
      contactStatus,
    });
  };

  if (!lead) return null;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="contact-status">Contact Status</Label>
        <Select value={contactStatus} onValueChange={setContactStatus}>
          <SelectTrigger data-testid="select-contact-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_contacted">Not Contacted</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="not_interested">Not Interested</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Enter tags separated by commas"
          data-testid="input-tags"
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this lead..."
          rows={3}
          data-testid="textarea-notes"
        />
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className="w-full"
        data-testid="button-update-lead"
      >
        {isLoading ? "Updating..." : "Update Lead"}
      </Button>
    </div>
  );
}
