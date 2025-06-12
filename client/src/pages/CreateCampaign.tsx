import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, Calendar, DollarSign, Tag } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function CreateCampaign() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    categoryId: "",
    imageUrl: "",
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      return response.json();
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/campaigns', {
        ...data,
        target: parseFloat(data.target),
        categoryId: parseInt(data.categoryId),
        deadline: new Date(data.deadline).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign created!",
        description: "Your campaign has been submitted for admin approval. You will be notified once it's reviewed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/organization/me"] });
      setLocation('/org-dashboard');
    },
    onError: (error) => {
      toast({
        title: "Failed to create campaign",
        description: "There was an error creating your campaign. Please try again.",
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

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      categoryId: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.target || !formData.deadline || !formData.categoryId) {
      toast({
        title: "Please fill in all required fields",
        description: "All fields marked with * are required.",
        variant: "destructive",
      });
      return;
    }

    const targetAmount = parseFloat(formData.target);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Invalid target amount",
        description: "Please enter a valid target amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate <= new Date()) {
      toast({
        title: "Invalid deadline",
        description: "Please select a deadline that is in the future.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate(formData);
  };

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Heart className="w-8 h-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-neutral-900">Create New Campaign</h1>
        </div>
        <p className="text-neutral-600">
          Create a fundraising campaign to support your organization's mission and goals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Provide detailed information about your campaign. All campaigns are reviewed by our admin team before going live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a compelling campaign title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Campaign Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your campaign goals, how funds will be used, and the impact it will make. Be specific and compelling to attract donors."
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="target">Target Amount (USD) *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="target"
                    name="target"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.target}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Campaign Deadline *</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    min={minDate}
                    value={formData.deadline}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center">
                        <i className={`${category.icon} mr-2`}></i>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageUrl">Campaign Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/campaign-image.jpg"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a URL to an image that represents your campaign. If not provided, a default image will be used.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Tag className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Campaign Review Process</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your campaign will be reviewed by our admin team within 2-3 business days. Once approved, 
                    it will be visible to all users and can start receiving donations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Heart className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Tips for Success</h4>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• Use a clear, compelling title that explains your cause</li>
                    <li>• Include specific details about how funds will be used</li>
                    <li>• Set a realistic target amount and deadline</li>
                    <li>• Choose the most appropriate category for better discoverability</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/org-dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
