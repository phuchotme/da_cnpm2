import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, GraduationCap, Heart, Leaf, Clock, Star } from "lucide-react";
import CampaignCard from "@/components/CampaignCard";

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
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

  const { data: organizations } = useQuery({
    queryKey: ["/api/organizations"],
    queryFn: async () => {
      const response = await fetch('/api/organizations');
      return response.json();
    },
  });

  const featuredCampaigns = campaigns?.slice(0, 3) || [];
  const featuredOrganizations = organizations?.slice(0, 3) || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Transparent Giving.<br />
                <span className="text-blue-200">Real Impact.</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Connect with verified organizations and track exactly how your donations create meaningful change in communities worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-50">
                  <Link href="/campaigns">Browse Campaigns</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/apply-organization">Start Fundraising</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Community volunteers helping"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                ${stats?.totalRaised ? Math.round(parseFloat(stats.totalRaised)).toLocaleString() : '0'}
              </div>
              <div className="text-neutral-600">Total Raised</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats?.activeCampaigns || 0}</div>
              <div className="text-neutral-600">Active Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats?.verifiedOrgs || 0}</div>
              <div className="text-neutral-600">Verified Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats?.totalDonors || 0}</div>
              <div className="text-neutral-600">Generous Donors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Featured Campaigns</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover verified campaigns making a real difference. Every donation is tracked and reported transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign: any) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {campaigns && campaigns.length > 3 && (
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/campaigns">View All Campaigns</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Organization Spotlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Trusted Organizations</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              All organizations undergo rigorous verification. Track their success rates and impact transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOrganizations.map((org: any) => (
              <Card key={org.id} className="bg-neutral-50 border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{org.name}</h3>
                      <div className="flex items-center text-secondary text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Verified Organization</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-neutral-600 text-sm mb-4">{org.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{org.successRate || 0}%</div>
                      <div className="text-xs text-neutral-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold text-primary mr-1">{org.rating || 0}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-600">Rating</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/organizations/${org.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
