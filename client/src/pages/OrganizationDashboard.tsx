import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, DollarSign, TrendingUp, Plus, Edit, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

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

  // State cho Dialog cập nhật chiến dịch
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [tab, setTab] = useState("progress");
  const [extendDays, setExtendDays] = useState(7);
  const [extendReason, setExtendReason] = useState("");
  const [targetReason, setTargetReason] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [progressTitle, setProgressTitle] = useState("");
  const [progressContent, setProgressContent] = useState("");
  const [progressImages, setProgressImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mutation gửi yêu cầu gia hạn hoặc thay đổi mục tiêu
  const extendCampaignMutation = useMutation({
    mutationFn: async ({ id, type, value, reason }: { id: number; type: string; value: string; reason: string }) => {
      return apiRequest("POST", `/api/campaigns/${id}/extend-request`, { type, value, reason });
    },
    onSuccess: () => {
      toast({ title: "Gửi yêu cầu thành công", description: "Yêu cầu của bạn đang chờ quản trị viên duyệt." });
      setOpenDialogId(null);
      setExtendDays(7);
      setExtendReason("");
      setTargetReason("");
      setNewTarget("");
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Gửi yêu cầu thất bại.", variant: "destructive" });
    }
  });

  // Mutation cập nhật tiến độ
  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, title, content, imageUrls }: { id: number; title: string; content: string; imageUrls?: string[] }) => {
      return apiRequest("POST", `/api/campaign-updates`, { campaignId: id, title, content, imageUrls });
    },
    onSuccess: () => {
      toast({ title: "Cập nhật tiến độ thành công" });
      setOpenDialogId(null);
      setProgressTitle("");
      setProgressContent("");
      setProgressImages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/organization/me"] });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Cập nhật tiến độ thất bại.", variant: "destructive" });
    }
  });

  // Xử lý upload nhiều ảnh một lần
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (Array.isArray(data.urls)) {
      setProgressImages(prev => [...prev, ...data.urls]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Không tìm thấy tổ chức</h1>
          <p className="text-neutral-600 mb-4">Bạn cần đăng ký trở thành tổ chức trước.</p>
          <Button asChild>
            <Link href="/apply-organization">Đăng ký tổ chức</Link>
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Bảng điều khiển tổ chức</h1>
          <p className="text-neutral-600">Quản lý các chiến dịch và theo dõi tác động của bạn</p>
        </div>
        {organization.status === 'approved' && (
          <Button asChild>
            <Link href="/create-campaign">
              <Plus className="w-4 h-4 mr-2" />
              Tạo chiến dịch mới
            </Link>
          </Button>
        )}
      </div>

      {organization.status !== 'approved' && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Trạng thái tổ chức: {organization.status === 'pending' ? 'Đang chờ duyệt' : 'Bị từ chối'}</h3>
            <p className="text-yellow-700">
              {organization.status === 'pending'
                ? 'Đơn đăng ký tổ chức của bạn đang được xem xét. Bạn sẽ nhận được thông báo khi được duyệt.'
                : 'Đơn đăng ký tổ chức của bạn đã bị từ chối. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">{activeCampaigns}</div>
                <div className="text-sm text-neutral-600">Chiến dịch đang hoạt động</div>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-secondary">{Math.round(totalRaised).toLocaleString()}₫</div>
                <div className="text-sm text-neutral-600">Tổng số tiền đã gây quỹ</div>
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
                <div className="text-sm text-neutral-600">Tỉ lệ thành công</div>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách chiến dịch */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch của bạn</CardTitle>
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
                      {campaign.status === 'approved' ? "Đã duyệt" : campaign.status === 'pending' ? "Chờ duyệt" : "Bị từ chối"}
                    </Badge>
                  </div>

                  {campaign.status === 'approved' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-neutral-600">Tiến độ</div>
                        <div className="text-lg font-semibold text-neutral-900">
                          {Math.round(parseFloat(campaign.raised)).toLocaleString()}₫ / {Math.round(parseFloat(campaign.target)).toLocaleString()}₫
                        </div>
                        <Progress
                          value={Math.round((parseFloat(campaign.raised) / parseFloat(campaign.target)) * 100)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">Hạn kết thúc</div>
                        <div className="text-lg font-semibold text-neutral-900">
                          {new Date(campaign.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">Số ngày còn lại</div>
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
                        Xem chiến dịch
                      </Link>
                    </Button>
                    {campaign.status === 'approved' && (
                      <Dialog open={openDialogId === campaign.id} onOpenChange={open => { if (!open) setOpenDialogId(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => { setOpenDialogId(campaign.id); setTab("progress"); setProgressTitle(""); setProgressContent(""); setProgressImages([]); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Cập nhật chiến dịch
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cập nhật chiến dịch</DialogTitle>
                          </DialogHeader>
                          <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="mb-4">
                              <TabsTrigger value="progress">Cập nhật tiến độ</TabsTrigger>
                              <TabsTrigger value="extend">Gia hạn thời gian</TabsTrigger>
                              <TabsTrigger value="target">Sửa mục tiêu</TabsTrigger>
                            </TabsList>
                            <TabsContent value="progress">
                              <div className="mb-4">
                                <Label htmlFor="progress-title">Tiêu đề tiến độ</Label>
                                <input
                                  id="progress-title"
                                  type="text"
                                  value={progressTitle}
                                  onChange={e => setProgressTitle(e.target.value)}
                                  className="border rounded px-2 py-1 w-full mt-1"
                                  placeholder="Nhập tiêu đề ngắn cho cập nhật này"
                                />
                              </div>
                              <div className="mb-4">
                                <Label htmlFor="progress-content">Nội dung tiến độ</Label>
                                <textarea
                                  id="progress-content"
                                  value={progressContent}
                                  onChange={e => setProgressContent(e.target.value)}
                                  className="border rounded px-2 py-1 w-full mt-1"
                                  rows={4}
                                  placeholder="Mô tả tiến độ mới nhất của chiến dịch..."
                                />
                              </div>
                              <div className="mb-4">
                                <Label>Ảnh minh họa (không bắt buộc)</Label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  ref={fileInputRef}
                                  onChange={handleImageUpload}
                                  className="block mt-1"
                                  disabled={uploading}
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {progressImages.map((url, idx) => (
                                    <div key={idx} className="relative">
                                      <img src={url} alt={`progress-img-${idx}`} className="w-20 h-20 object-cover rounded border" />
                                      <button
                                        type="button"
                                        className="absolute top-0 right-0 bg-white rounded-full p-1 text-xs"
                                        onClick={() => setProgressImages(imgs => imgs.filter((_, i) => i !== idx))}
                                        title="Xóa"
                                      >✕</button>
                                    </div>
                                  ))}
                                </div>
                                {uploading && <div className="text-xs text-blue-600 mt-1">Đang tải ảnh...</div>}
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => updateProgressMutation.mutate({
                                    id: campaign.id,
                                    title: progressTitle,
                                    content: progressContent,
                                    imageUrls: progressImages
                                  })}
                                  disabled={!progressTitle.trim() || !progressContent.trim() || updateProgressMutation.isPending || uploading}
                                >
                                  {updateProgressMutation.isPending ? "Đang cập nhật..." : "Cập nhật tiến độ"}
                                </Button>
                              </DialogFooter>
                            </TabsContent>
                            <TabsContent value="extend">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="extend-days">Gia hạn thêm (ngày)</Label>
                                  <input
                                    id="extend-days"
                                    type="number"
                                    min={1}
                                    value={extendDays}
                                    onChange={e => setExtendDays(Number(e.target.value))}
                                    className="border rounded px-2 py-1 w-full mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="extend-reason">Lý do gia hạn</Label>
                                  <textarea
                                    id="extend-reason"
                                    value={extendReason}
                                    onChange={e => setExtendReason(e.target.value)}
                                    className="border rounded px-2 py-1 w-full mt-1"
                                    rows={3}
                                    placeholder="Giải thích lý do bạn muốn gia hạn chiến dịch"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() =>
                                    extendCampaignMutation.mutate({
                                      id: campaign.id,
                                      type: "deadline",
                                      value: extendDays.toString(),
                                      reason: extendReason
                                    })
                                  }
                                  disabled={!extendReason.trim() || extendCampaignMutation.isPending}
                                >
                                  {extendCampaignMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu gia hạn"}
                                </Button>
                              </DialogFooter>
                            </TabsContent>
                            <TabsContent value="target">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="new-target">Mục tiêu mới (VNĐ)</Label>
                                  <input
                                    id="new-target"
                                    type="number"
                                    min={1}
                                    value={newTarget}
                                    onChange={e => setNewTarget(e.target.value)}
                                    className="border rounded px-2 py-1 w-full mt-1"
                                    placeholder="Nhập số tiền mục tiêu mới"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="target-reason">Lý do thay đổi mục tiêu</Label>
                                  <textarea
                                    id="target-reason"
                                    value={targetReason}
                                    onChange={e => setTargetReason(e.target.value)}
                                    className="border rounded px-2 py-1 w-full mt-1"
                                    rows={3}
                                    placeholder="Giải thích lý do bạn muốn thay đổi mục tiêu"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() =>
                                    extendCampaignMutation.mutate({
                                      id: campaign.id,
                                      type: "target",
                                      value: newTarget,
                                      reason: targetReason
                                    })
                                  }
                                  disabled={!newTarget.trim() || !targetReason.trim() || extendCampaignMutation.isPending}
                                >
                                  {extendCampaignMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu thay đổi mục tiêu"}
                                </Button>
                              </DialogFooter>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Chưa có chiến dịch nào</h3>
              <p className="text-neutral-600 mb-4">Tạo chiến dịch đầu tiên để bắt đầu gây quỹ</p>
              {organization.status === 'approved' && (
                <Button asChild>
                  <Link href="/create-campaign">Tạo chiến dịch mới</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}