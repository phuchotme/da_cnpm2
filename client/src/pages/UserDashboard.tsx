import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, DollarSign, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function UserDashboard() {
  const { data: donations, isLoading } = useQuery({
    queryKey: ["/api/donations/user/me"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/donations/user/me');
      return response.json();
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
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

  const totalDonated = donations?.reduce((sum: number, donation: any) => sum + parseFloat(donation.amount), 0) || 0;
  const campaignsSupported = new Set(donations?.map((d: any) => d.campaignId)).size || 0;
  const recommendedCampaigns = campaigns?.slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Dashboard</h1>
        <p className="text-neutral-600">Track your donations and discover new ways to make an impact</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Recent Donations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neutral-900">Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {donations && donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.slice(0, 5).map((donation: any) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-900">
                            <Link 
                              href={`/campaigns/${donation.campaignId}`}
                              className="hover:text-primary transition-colors"
                            >
                              {donation.campaign.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-neutral-600">
                            Donated on {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          ${Math.round(parseFloat(donation.amount))}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {donation.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No donations yet</h3>
                  <p className="text-neutral-600 mb-4">Start making a difference by supporting a campaign</p>
                  <Button asChild>
                    <Link href="/campaigns">Browse Campaigns</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Impact Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900">Impact Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">${Math.round(totalDonated)}</div>
                  <div className="text-sm text-neutral-600">Total Donated</div>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-secondary">{campaignsSupported}</div>
                  <div className="text-sm text-neutral-600">Campaigns Supported</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900">Recommended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedCampaigns.map((campaign: any) => (
                  <div
                    key={campaign.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                  >
                    <Link href={`/campaigns/${campaign.id}`}>
                      <h4 className="font-medium text-sm text-neutral-900 hover:text-primary transition-colors">
                        {campaign.title}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">
                        {campaign.category.name} • {campaign.organization.name}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/campaigns">View All Campaigns</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
