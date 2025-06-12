import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building, Heart, CheckCircle, Flag, AlertTriangle, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useState } from "react";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actionReason, setActionReason] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: string; action: string } | null>(null);

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
        description: `Organization ${selectedItem?.action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedItem(null);
      setActionReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedItem?.action} organization.`,
        variant: "destructive",
      });
    },
  });

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
        description: `Campaign ${selectedItem?.action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedItem(null);
      setActionReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedItem?.action} campaign.`,
        variant: "destructive",
      });
    },
  });

  const handleAction = () => {
    if (!selectedItem || !actionReason.trim()) return;

    if (selectedItem.type === 'organization') {
      organizationActionMutation.mutate({
        id: selectedItem.id,
        action: selectedItem.action as 'approve' | 'reject',
        reason: actionReason,
      });
    } else if (selectedItem.type === 'campaign') {
      campaignActionMutation.mutate({
        id: selectedItem.id,
        action: selectedItem.action as 'approve' | 'reject',
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
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-secondary text-white hover:bg-green-600"
                            onClick={() => setSelectedItem({ id: org.id, type: 'organization', action: 'approve' })}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Organization</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to approve "{org.name}"? Please provide a reason for approval.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">Reason for approval</Label>
                              <Textarea
                                id="reason"
                                placeholder="Organization meets all requirements..."
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedItem(null)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAction}
                              disabled={!actionReason.trim() || organizationActionMutation.isPending}
                            >
                              {organizationActionMutation.isPending ? "Approving..." : "Approve"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedItem({ id: org.id, type: 'organization', action: 'reject' })}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Organization</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to reject "{org.name}"? Please provide a reason for rejection.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">Reason for rejection</Label>
                              <Textarea
                                id="reason"
                                placeholder="Missing required documentation..."
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedItem(null)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleAction}
                              disabled={!actionReason.trim() || organizationActionMutation.isPending}
                            >
                              {organizationActionMutation.isPending ? "Rejecting..." : "Reject"}
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${
                      log.actionType.includes('approve') ? 'bg-secondary' :
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
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-secondary text-white hover:bg-green-600"
                          onClick={() => setSelectedItem({ id: campaign.id, type: 'campaign', action: 'approve' })}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Campaign</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to approve "{campaign.title}"? Please provide a reason for approval.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reason">Reason for approval</Label>
                            <Textarea
                              id="reason"
                              placeholder="Campaign meets all guidelines..."
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedItem(null)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAction}
                            disabled={!actionReason.trim() || campaignActionMutation.isPending}
                          >
                            {campaignActionMutation.isPending ? "Approving..." : "Approve"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedItem({ id: campaign.id, type: 'campaign', action: 'reject' })}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Campaign</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to reject "{campaign.title}"? Please provide a reason for rejection.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reason">Reason for rejection</Label>
                            <Textarea
                              id="reason"
                              placeholder="Unclear funding goals..."
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedItem(null)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleAction}
                            disabled={!actionReason.trim() || campaignActionMutation.isPending}
                          >
                            {campaignActionMutation.isPending ? "Rejecting..." : "Reject"}
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
