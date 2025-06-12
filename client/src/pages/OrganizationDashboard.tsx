import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, DollarSign, TrendingUp, Plus, Edit, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function OrganizationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organization } = useQuery({
    queryKey: ["/api/organizations/user/me"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/organizations/user/me');
      return response.json();
    },
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns/organization/me"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/campaigns/organization/me');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Organization not found</h1>
          <p className="text-neutral-600 mb-4">You need to apply to become an organization first.</p>
          <Button asChild>
            <Link href="/apply-organization">Apply to Become Organization</Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'approved').length || 0;
  const totalRaised = campaigns?.reduce((sum: number, campaign: any) => sum + parseFloat(campaign.raised), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Organization Dashboard</h1>
          <p className="text-neutral-600">Manage your campaigns and track your impact</p>
        </div>
        {organization.status === 'approved' && (
          <Button asChild>
            <Link href="/create-campaign">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        )}
      </div>

      {organization.status !== 'approved' && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Organization Status: {organization.status}</h3>
            <p className="text-yellow-700">
              {organization.status === 'pending' 
                ? 'Your organization application is under review. You will be notified once approved.'
                : 'Your organization application has been rejected. Please contact support for more information.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">{activeCampaigns}</div>
                <div className="text-sm text-neutral-600">Active Campaigns</div>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-secondary">${Math.round(totalRaised)}</div>
                <div className="text-sm text-neutral-600">Total Raised</div>
              </div>
              <DollarSign className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-accent">{organization.successRate || 0}%</div>
                <div className="text-sm text-neutral-600">Success Rate</div>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-neutral-900">Your Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <div className="space-y-6">
              {campaigns.map((campaign: any) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">{campaign.title}</h3>
                      <p className="text-sm text-neutral-600 mt-1">{campaign.description}</p>
                    </div>
                    <Badge
                      variant={
                        campaign.status === 'approved' ? 'default' :
                        campaign.status === 'pending' ? 'secondary' :
                        campaign.status === 'rejected' ? 'destructive' : 'outline'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  {campaign.status === 'approved' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-neutral-600">Progress</div>
                        <div className="text-lg font-semibold text-neutral-900">
                          ${Math.round(parseFloat(campaign.raised))} / ${Math.round(parseFloat(campaign.target))}
                        </div>
                        <Progress 
                          value={Math.round((parseFloat(campaign.raised) / parseFloat(campaign.target)) * 100)} 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">Deadline</div>
                        <div className="text-lg font-semibold text-neutral-900">
                          {new Date(campaign.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">Days Left</div>
                        <div className="text-lg font-semibold text-neutral-900">
                          {Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Campaign
                      </Link>
                    </Button>
                    {campaign.status === 'approved' && (
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Update Progress
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No campaigns yet</h3>
              <p className="text-neutral-600 mb-4">Create your first campaign to start fundraising</p>
              {organization.status === 'approved' && (
                <Button asChild>
                  <Link href="/create-campaign">Create Campaign</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
