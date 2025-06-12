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
        title: "Gửi đơn thành công!",
        description: "Đơn đăng ký tổ chức của bạn đã được gửi để xét duyệt. Bạn sẽ nhận được thông báo khi có kết quả.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations/user/me"] });
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Gửi đơn thất bại",
        description: "Có lỗi xảy ra khi gửi đơn đăng ký. Vui lòng thử lại.",
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
        title: "Tải lên thất bại",
        description: "Không thể tải lên tệp.",
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        description: "Tên tổ chức và mô tả là bắt buộc.",
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
          <h1 className="text-3xl font-bold text-neutral-900">Đăng ký trở thành tổ chức</h1>
        </div>
        <p className="text-neutral-600">
          Tham gia nền tảng của chúng tôi với tư cách là tổ chức đã xác thực để tạo chiến dịch và gây quỹ cho mục tiêu của bạn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn đăng ký tổ chức</CardTitle>
          <CardDescription>
            Vui lòng cung cấp thông tin chi tiết về tổ chức của bạn. Tất cả đơn đăng ký sẽ được đội ngũ quản trị viên xét duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Tên tổ chức *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên tổ chức của bạn"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả tổ chức *</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả sứ mệnh, mục tiêu và hoạt động của tổ chức bạn. Vui lòng trình bày chi tiết để hỗ trợ quá trình xét duyệt."
                rows={6}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Tài liệu minh chứng</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Tải lên các tài liệu minh chứng (giấy phép đăng ký, giấy xác nhận miễn thuế, v.v.)
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
                  <p className="text-xs text-blue-500 mt-2">Đang tải lên...</p>
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
                  <h4 className="font-medium text-blue-900">Quy trình xét duyệt đơn</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Đội ngũ quản trị viên sẽ xét duyệt đơn đăng ký của bạn trong vòng 3-5 ngày làm việc. Bạn sẽ nhận được email thông báo khi đơn được duyệt hoặc cần bổ sung thông tin.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Building className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Thông tin bắt buộc</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Giấy tờ đăng ký tổ chức hợp pháp</li>
                    <li>• Ảnh chụp căn cước công dân hai mặt của người chịu trách nhiệm chính</li>
                    <li>• Mô tả rõ ràng về sứ mệnh và hoạt động của tổ chức</li>
                    <li>• Thông tin liên hệ để xác minh</li>
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
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createOrganizationMutation.isPending || uploading}
              >
                {createOrganizationMutation.isPending ? "Đang gửi..." : uploading ? "Đang tải lên..." : "Gửi đơn đăng ký"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}