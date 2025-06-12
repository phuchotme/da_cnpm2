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

  // State cho yêu cầu chỉnh sửa campaign
  const [selectedExtend, setSelectedExtend] = useState<any | null>(null);
  const [extendActionType, setExtendActionType] = useState<"approve" | "reject" | null>(null);
  const [extendActionReason, setExtendActionReason] = useState("");

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

  // Query cho các yêu cầu chỉnh sửa campaign
  const { data: pendingExtendRequests, refetch: refetchExtend } = useQuery({
    queryKey: ["/api/admin/campaign-extend-requests"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/campaign-extend-requests?status=pending');
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
        title: "Thành công",
        description: `Tổ chức đã được ${actionType === 'approve' ? 'duyệt' : 'từ chối'} thành công.`,
      });
      setSelectedOrg(null);
      setActionReason("");
      setActionType(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: `Không thể ${actionType === 'approve' ? 'duyệt' : 'từ chối'} tổ chức.`,
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
        title: "Thành công",
        description: `Chiến dịch đã được ${actionType === 'approve' ? 'duyệt' : 'từ chối'} thành công.`,
      });
      setSelectedOrg(null);
      setActionReason("");
      setActionType(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: `Không thể ${actionType === 'approve' ? 'duyệt' : 'từ chối'} chiến dịch.`,
        variant: "destructive",
      });
    },
  });

  // Mutation cho duyệt/từ chối yêu cầu chỉnh sửa campaign
  const extendRequestActionMutation = useMutation({
    mutationFn: async ({ id, action, adminNote }: { id: number; action: 'approve' | 'reject'; adminNote: string }) => {
      const response = await apiRequest(
        'PUT',
        `/api/admin/campaign-extend-requests/${id}/${action}`,
        { adminNote }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaign-extend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      refetchExtend();
      toast({
        title: "Thành công",
        description: `Yêu cầu đã được ${extendActionType === 'approve' ? 'duyệt' : 'từ chối'} thành công.`,
      });
      setSelectedExtend(null);
      setExtendActionReason("");
      setExtendActionType(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: `Không thể ${extendActionType === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu.`,
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
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Bảng điều khiển quản trị viên</h1>
        <p className="text-neutral-600">Quản lý tổ chức, chiến dịch và hoạt động nền tảng</p>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">{pendingOrganizations?.length || 0}</div>
                <div className="text-sm text-neutral-600">Tổ chức chờ duyệt</div>
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
                <div className="text-sm text-neutral-600">Chiến dịch chờ duyệt</div>
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
                <div className="text-sm text-neutral-600">Chiến dịch đang hoạt động</div>
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
                <div className="text-sm text-neutral-600">Nội dung bị gắn cờ</div>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tổ chức chờ duyệt */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-neutral-900">Đơn đăng ký tổ chức chờ duyệt</CardTitle>
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
                          Đăng ký ngày {new Date(org.createdAt).toLocaleDateString()}
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
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Chi tiết tổ chức</DialogTitle>
                            <DialogDescription>
                              <b>Tên:</b> {org.name}<br />
                              <b>Mô tả:</b> {org.description}<br />
                              <b>Ngày đăng ký:</b> {new Date(org.createdAt).toLocaleString()}<br />
                              <b>Tài liệu đính kèm:</b>
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
                                        title="Bấm để xem ảnh"
                                      >
                                        <img
                                          src={url}
                                          alt={`Tài liệu ${idx + 1}`}
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
                                        Tải file {idx + 1}
                                      </a>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-neutral-500">Không có tài liệu.</span>
                                )}
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="reason">Lý do</Label>
                              <Textarea
                                id="reason"
                                placeholder="Nhập lý do phê duyệt hoặc từ chối..."
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
                              {organizationActionMutation.isPending && actionType === "reject" ? "Đang từ chối..." : "Từ chối"}
                            </Button>
                            <Button
                              onClick={() => {
                                setActionType("approve");
                                setTimeout(handleAction, 0);
                              }}
                              disabled={!actionReason.trim() || organizationActionMutation.isPending}
                            >
                              {organizationActionMutation.isPending && actionType === "approve" ? "Đang duyệt..." : "Duyệt"}
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
                <p className="text-neutral-600">Không có đơn đăng ký tổ chức nào chờ duyệt</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nhật ký quản trị viên */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-neutral-900">Nhật ký hoạt động quản trị viên</CardTitle>
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
                        {log.actionType === 'approve_org' && 'Duyệt tổ chức'}
                        {log.actionType === 'reject_org' && 'Từ chối tổ chức'}
                        {log.actionType === 'approve_campaign' && 'Duyệt chiến dịch'}
                        {log.actionType === 'reject_campaign' && 'Từ chối chiến dịch'}
                        {log.actionType === 'extend_campaign' && 'Gia hạn/sửa chiến dịch'}
                        {log.actionType === 'disable_campaign' && 'Vô hiệu hóa chiến dịch'}
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {new Date(log.createdAt).toLocaleString()} bởi {log.admin.firstName} {log.admin.lastName}
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
                <p className="text-neutral-600">Chưa có hoạt động quản trị viên nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Các chỉnh sửa về campaign */}
      <Card className="mt-8">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-neutral-900">Các chỉnh sửa về chiến dịch</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pendingExtendRequests && pendingExtendRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingExtendRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900">
                      {req.type === "deadline" ? "Gia hạn thời gian" : "Sửa số tiền mục tiêu"}
                    </div>
                    <div className="text-sm text-neutral-600">
                      Mã chiến dịch: {req.campaignId} <br />
                      {req.type === "deadline"
                        ? `Thêm số ngày: ${req.value}`
                        : `Mục tiêu mới: ${Number(req.value).toLocaleString()}₫`}
                      <br />
                      Lý do: {req.reason}
                    </div>
                  </div>
                  <div>
                    <Dialog open={selectedExtend?.id === req.id} onOpenChange={open => {
                      if (!open) {
                        setSelectedExtend(null);
                        setExtendActionReason("");
                        setExtendActionType(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedExtend(req);
                            setExtendActionReason("");
                            setExtendActionType(null);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Chi tiết yêu cầu chỉnh sửa chiến dịch</DialogTitle>
                          <DialogDescription>
                            <b>Loại yêu cầu:</b> {req.type === "deadline" ? "Gia hạn thời gian" : "Sửa số tiền mục tiêu"}<br />
                            <b>Mã chiến dịch:</b> {req.campaignId}<br />
                            <b>Giá trị:</b> {req.type === "deadline" ? `${req.value} ngày` : `${Number(req.value).toLocaleString()}₫`}<br />
                            <b>Lý do:</b> {req.reason}<br />
                            <b>Ngày gửi:</b> {new Date(req.createdAt).toLocaleString()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="extend-admin-note">Ghi chú của quản trị viên</Label>
                            <Textarea
                              id="extend-admin-note"
                              placeholder="Nhập ghi chú khi duyệt hoặc từ chối..."
                              value={extendActionReason}
                              onChange={e => setExtendActionReason(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setExtendActionType("reject");
                              setTimeout(() => {
                                extendRequestActionMutation.mutate({
                                  id: req.id,
                                  action: "reject",
                                  adminNote: extendActionReason
                                });
                              }, 0);
                            }}
                            disabled={!extendActionReason.trim() || extendRequestActionMutation.isPending}
                          >
                            {extendRequestActionMutation.isPending && extendActionType === "reject" ? "Đang từ chối..." : "Từ chối"}
                          </Button>
                          <Button
                            onClick={() => {
                              setExtendActionType("approve");
                              setTimeout(() => {
                                extendRequestActionMutation.mutate({
                                  id: req.id,
                                  action: "approve",
                                  adminNote: extendActionReason
                                });
                              }, 0);
                            }}
                            disabled={!extendActionReason.trim() || extendRequestActionMutation.isPending}
                          >
                            {extendRequestActionMutation.isPending && extendActionType === "approve" ? "Đang duyệt..." : "Duyệt"}
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
              <Flag className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">Không có yêu cầu chỉnh sửa chiến dịch nào đang chờ duyệt</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chiến dịch chờ duyệt */}
      {pendingCampaigns && pendingCampaigns.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch chờ duyệt</CardTitle>
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
                        {campaign.organization.name} • Mục tiêu: {Math.round(parseFloat(campaign.target)).toLocaleString()}₫
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
                          Xem chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Chi tiết chiến dịch</DialogTitle>
                          <DialogDescription>
                            <b>Tiêu đề:</b> {campaign.title}<br />
                            <b>Mô tả:</b> {campaign.description}<br />
                            <b>Mục tiêu:</b> {Math.round(parseFloat(campaign.target)).toLocaleString()}₫<br />
                            <b>Ngày tạo:</b> {new Date(campaign.createdAt).toLocaleString()}<br />
                            <b>Tổ chức:</b> {campaign.organization.name}<br />
                            <b>Mô tả tổ chức:</b> {campaign.organization.description}<br />
                            <b>Tài liệu tổ chức:</b>
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
                                      title="Bấm để xem ảnh"
                                    >
                                      <img
                                        src={url}
                                        alt={`Tài liệu ${idx + 1}`}
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
                                      Tải file {idx + 1}
                                    </a>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-neutral-500">Không có tài liệu.</span>
                              )}
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="reason">Lý do</Label>
                            <Textarea
                              id="reason"
                              placeholder="Nhập lý do phê duyệt hoặc từ chối..."
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
                            {campaignActionMutation.isPending && actionType === "reject" ? "Đang từ chối..." : "Từ chối"}
                          </Button>
                          <Button
                            onClick={() => {
                              setActionType("approve");
                              setTimeout(handleAction, 0);
                            }}
                            disabled={!actionReason.trim() || campaignActionMutation.isPending}
                          >
                            {campaignActionMutation.isPending && actionType === "approve" ? "Đang duyệt..." : "Duyệt"}
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