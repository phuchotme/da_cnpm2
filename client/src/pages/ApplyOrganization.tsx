import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Building } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function ApplyOrganization() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    documents: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createOrganizationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/organizations', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your organization application has been submitted for review. You will be notified once it's processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations/user/me"] });
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Upload nhiều file cùng lúc
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const data = new FormData();
    for (const file of Array.from(e.target.files)) {
      data.append("files", file); // key phải là "files"
    }
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: data,
      });
      const result = await res.json();
      if (result.urls && Array.isArray(result.urls)) {
        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, ...result.urls],
        }));
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Could not upload files.",
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Organization name and description are required.",
        variant: "destructive",
      });
      return;
    }
    createOrganizationMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Building className="w-8 h-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-neutral-900">Apply to Become an Organization</h1>
        </div>
        <p className="text-neutral-600">
          Join our platform as a verified organization to create campaigns and raise funds for your cause.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Application</CardTitle>
          <CardDescription>
            Please provide detailed information about your organization. All applications are reviewed by our admin team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your organization name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Organization Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your organization's mission, goals, and activities. Be as detailed as possible to help our review process."
                rows={6}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Supporting Documents</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload supporting documents (registration certificates, tax-exempt status, etc.)
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="mx-auto mt-2"
                />
                {uploading && (
                  <p className="text-xs text-blue-500 mt-2">Uploading...</p>
                )}
                {formData.documents.length > 0 && (
                  <ul className="mt-2 text-xs text-green-700 text-left">
                    {formData.documents.map((url, idx) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Application Review Process</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Our admin team will review your application within 3-5 business days. You will receive an email notification
                    once your application is approved or if additional information is needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Building className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Required Information</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Official organization registration documents</li>
                    <li>• Tax-exempt status documentation (if applicable)</li>
                    <li>• Clear description of your organization's mission and activities</li>
                    <li>• Contact information for verification purposes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createOrganizationMutation.isPending || uploading}
              >
                {createOrganizationMutation.isPending ? "Submitting..." : uploading ? "Uploading..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}