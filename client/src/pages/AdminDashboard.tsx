import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building, Heart, CheckCircle, Flag, AlertTriangle, Check, X, Eye } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useState } from "react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actionReason, setActionReason] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      return response.json();
    },
  });

  const { data: pendingOrganizations } = useQuery({
    queryKey: ["/api/admin/organizations/pending"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/organizations/pending');
      return response.json();
    },
  });

  const { data: pendingCampaigns } = useQuery({
    queryKey: ["/api/admin/campaigns/pending"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/campaigns/pending');
      return response.json();
    },
  });

  const { data: adminLogs } = useQuery({
    queryKey: ["/api/admin/logs"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/logs');
      return response.json();
    },
  });

  // Mutation cho tổ chức
  const organizationActionMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number; action: 'approve' | 'reject'; reason: string }) => {
      const response = await apiRequest('PUT', `/api/admin/organizations/${id}/${action}`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: `Organization ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedOrg(null);
      setActionReason("");
      setActionType(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${actionType} organization.`,
        variant: "destructive",
      });
    },
  });

  // Mutation cho campaign
  const campaignActionMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number; action: 'approve' | 'reject'; reason: string }) => {
      const response = await apiRequest('PUT', `/api/admin/campaigns/${id}/${action}`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: `Campaign ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedOrg(null);
      setActionReason("");
      setActionType(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${actionType} campaign.`,
        variant: "destructive",
      });
    },
  });

  // Phân biệt gọi mutation nào
  const handleAction = () => {
    if (!selectedOrg || !actionReason.trim() || !actionType) return;
    if (selectedOrg.title) {
      // Có title => là campaign
      campaignActionMutation.mutate({
        id: selectedOrg.id,
        action: actionType,
        reason: actionReason,
      });
    } else {
      // Không có title => là organization
      organizationActionMutation.mutate({
        id: selectedOrg.id,
        action: actionType,
        reason: actionReason,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-600">Manage organizations, campaigns, and platform operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">{pendingOrganizations?.length || 0}</div>
                <div className="text-sm text-neutral-600">Pending Organizations</div>
              </div>
              <Building className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-accent">{pendingCampaigns?.length || 0}</div>
                <div className="text-sm text-neutral-600">Pending Campaigns</div>
              </div>
              <Heart className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-secondary">{stats?.activeCampaigns || 0}</div>
                <div className="text-sm text-neutral-600">Active Campaigns</div>
              </div>
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-500">0</div>
                <div className="text-sm text-neutral-600">Flagged Content</div>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Organizations */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-neutral-900">Pending Organization Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {pendingOrganizations && pendingOrganizations.length > 0 ? (
              <div className="space-y-4">
                {pendingOrganizations.map((org: any) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center mr-4">
                        <Building className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">{org.name}</h3>
                        <p className="text-sm text-neutral-600">
                          Applied {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Dialog open={selectedOrg?.id === org.id} onOpenChange={(open) => {
                        if (!open) {
                          setSelectedOrg(null);
                          setActionReason("");
                          setActionType(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrg(org);
                              setActionReason("");
                              setActionType(null);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Organization Detail</DialogTitle>
                            <DialogDescription>
                              <b>Name:</b> {org.name}<br />
                              <b>Description:</b> {org.description}<br />
                              <b>Applied at:</b> {new Date(org.createdAt).toLocaleString()}<br />
                              <b>Supporting Documents:</b>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {org.documents && org.documents.length > 0 ? (
                                  org.documents.map((url: string, idx: number) => {
                                    const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                    return isImage ? (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Click to view full image"
                                      >
                                        <img
                                          src={url}
                                          alt={`Document ${idx + 1}`}
                                          className="w-28 h-28 object-cover rounded border hover:scale-105 transition"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        key={idx}
                                        href={url}
                                        download
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs hover:bg-blue-100"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                                        </svg>
                                        Download file {idx + 1}
                                      </a>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-neutral-500">No documents uploaded.</span>
                                )}
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="reason">Reason</Label>
                              <Textarea
                                id="reason"
                                placeholder="Enter reason for approval or rejection..."
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setActionType("reject");
                                setTimeout(handleAction, 0);
                              }}
                              disabled={!actionReason.trim() || organizationActionMutation.isPending}
                            >
                              {organizationActionMutation.isPending && actionType === "reject" ? "Rejecting..." : "Reject"}
                            </Button>
                            <Button
                              onClick={() => {
                                setActionType("approve");
                                setTimeout(handleAction, 0);
                              }}
                              disabled={!actionReason.trim() || organizationActionMutation.isPending}
                            >
                              {organizationActionMutation.isPending && actionType === "approve" ? "Approving..." : "Approve"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No pending organization applications</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Admin Actions */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-neutral-900">Recent Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {adminLogs && adminLogs.length > 0 ? (
              <div className="space-y-4">
                {adminLogs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-start p-4 bg-neutral-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${log.actionType.includes('approve') ? 'bg-secondary' :
                      log.actionType.includes('reject') ? 'bg-red-500' : 'bg-primary'
                      }`}>
                      {log.actionType.includes('approve') ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : log.actionType.includes('reject') ? (
                        <X className="w-4 h-4 text-white" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900">
                        {log.actionType === 'approve_org' && 'Approved organization'}
                        {log.actionType === 'reject_org' && 'Rejected organization'}
                        {log.actionType === 'approve_campaign' && 'Approved campaign'}
                        {log.actionType === 'reject_campaign' && 'Rejected campaign'}
                        {log.actionType === 'extend_campaign' && 'Extended campaign'}
                        {log.actionType === 'disable_campaign' && 'Disabled campaign'}
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {new Date(log.createdAt).toLocaleString()} by {log.admin.firstName} {log.admin.lastName}
                      </p>
                      {log.reason && (
                        <p className="text-xs text-neutral-500 mt-1">"{log.reason}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No admin actions recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Campaigns */}
      {pendingCampaigns && pendingCampaigns.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-neutral-900">Pending Campaign Approvals</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {pendingCampaigns.map((campaign: any) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mr-4">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">{campaign.title}</h3>
                      <p className="text-sm text-neutral-600">
                        {campaign.organization.name} • Target: ${Math.round(parseFloat(campaign.target))}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Dialog open={selectedOrg?.id === campaign.id} onOpenChange={(open) => {
                      if (!open) {
                        setSelectedOrg(null);
                        setActionReason("");
                        setActionType(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrg(campaign);
                            setActionReason("");
                            setActionType(null);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Campaign Detail</DialogTitle>
                          <DialogDescription>
                            <b>Title:</b> {campaign.title}<br />
                            <b>Description:</b> {campaign.description}<br />
                            <b>Target:</b> ${Math.round(parseFloat(campaign.target))}<br />
                            <b>Created at:</b> {new Date(campaign.createdAt).toLocaleString()}<br />
                            <b>Organization:</b> {campaign.organization.name}<br />
                            <b>Org Description:</b> {campaign.organization.description}<br />
                            <b>Org Documents:</b>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {campaign.organization.documents && campaign.organization.documents.length > 0 ? (
                                campaign.organization.documents.map((url: string, idx: number) => {
                                  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                  return isImage ? (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Click to view full image"
                                    >
                                      <img
                                        src={url}
                                        alt={`Document ${idx + 1}`}
                                        className="w-28 h-28 object-cover rounded border hover:scale-105 transition"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      key={idx}
                                      href={url}
                                      download
                                      className="flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs hover:bg-blue-100"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                                      </svg>
                                      Download file {idx + 1}
                                    </a>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-neutral-500">No documents uploaded.</span>
                              )}
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                              id="reason"
                              placeholder="Enter reason for approval or rejection..."
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setActionType("reject");
                              setTimeout(handleAction, 0);
                            }}
                            disabled={!actionReason.trim() || campaignActionMutation.isPending}
                          >
                            {campaignActionMutation.isPending && actionType === "reject" ? "Rejecting..." : "Reject"}
                          </Button>
                          <Button
                            onClick={() => {
                              setActionType("approve");
                              setTimeout(handleAction, 0);
                            }}
                            disabled={!actionReason.trim() || campaignActionMutation.isPending}
                          >
                            {campaignActionMutation.isPending && actionType === "approve" ? "Approving..." : "Approve"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}