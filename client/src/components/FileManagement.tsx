import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function FileManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["/api/files"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/files/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "File has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDownload = (fileId: string, filename: string) => {
    window.open(`/api/files/${fileId}/download`, "_blank");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("csv") || fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return "fas fa-file-csv";
    }
    if (fileType.includes("pdf")) {
      return "fas fa-file-pdf";
    }
    if (fileType.includes("image")) {
      return "fas fa-file-image";
    }
    return "fas fa-file";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">File Management</h1>
        <p className="text-muted-foreground">Upload, manage, and download your lead generation files</p>
      </div>

      {/* Upload Section */}
      <Card data-testid="card-file-upload">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-serif">Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-cloud-upload-alt text-primary text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">CSV, Excel, or other data files</p>
                </div>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  data-testid="input-file-upload"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById("file-upload")?.click()}
                  data-testid="button-select-file"
                >
                  Select File
                </Button>
              </div>
            </div>
            
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className={`${getFileIcon(selectedFile.type)} text-primary`}></i>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    data-testid="button-upload-file"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    data-testid="button-cancel-upload"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card data-testid="card-files-list">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold font-serif">Your Files</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {files.length} files
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-folder-open text-muted-foreground text-xl"></i>
              </div>
              <p className="text-sm">No files uploaded yet</p>
              <p className="text-xs">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file: any, index: number) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${getFileIcon(file.fileType)} text-primary text-lg`}></i>
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.originalName}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file.id, file.originalName)}
                      data-testid={`button-download-${index}`}
                    >
                      <i className="fas fa-download text-muted-foreground"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-${index}`}
                    >
                      <i className="fas fa-trash text-current"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Operations */}
      <Card data-testid="card-file-operations">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-serif">Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" disabled data-testid="button-merge-files">
              <i className="fas fa-object-group mr-2"></i>
              Merge Files
            </Button>
            <Button variant="outline" disabled data-testid="button-validate-data">
              <i className="fas fa-check-double mr-2"></i>
              Validate Data
            </Button>
            <Button variant="outline" disabled data-testid="button-export-all">
              <i className="fas fa-download mr-2"></i>
              Export All
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Select files above to enable bulk operations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
