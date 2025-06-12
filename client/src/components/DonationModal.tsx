// import { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useToast } from "@/hooks/use-toast";
// import { DollarSign, Lock } from "lucide-react";
// import { apiRequest } from "@/lib/api";

// interface DonationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   campaign: {
//     id: number;
//     title: string;
//     description: string;
//   };
// }

// export default function DonationModal({ isOpen, onClose, campaign }: DonationModalProps) {
//   const [amount, setAmount] = useState("");
//   const [donationType, setDonationType] = useState("money");
//   const [anonymous, setAnonymous] = useState(false);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const donationMutation = useMutation({
//     mutationFn: async (data: { campaignId: number; amount: string; type: string; anonymous: boolean }) => {
//       const response = await apiRequest('POST', '/api/donations', data);
//       return response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Cảm ơn bạn đã ủng hộ!",
//         description: "Khoản quyên góp của bạn đã được ghi nhận thành công. Bạn sẽ nhận được email xác nhận trong thời gian sớm nhất.",
//       });
//       queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}`] });
//       queryClient.invalidateQueries({ queryKey: [`/api/donations/campaign/${campaign.id}`] });
//       queryClient.invalidateQueries({ queryKey: ["/api/donations/user/me"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
//       onClose();
//       setAmount("");
//       setDonationType("money");
//       setAnonymous(false);
//     },
//     onError: (error) => {
//       toast({
//         title: "Quyên góp thất bại",
//         description: "Đã xảy ra lỗi khi xử lý quyên góp. Vui lòng thử lại.",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleQuickAmount = (value: number) => {
//     setAmount(value.toString());
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const donationAmount = parseFloat(amount);
//     if (isNaN(donationAmount) || donationAmount <= 0) {
//       toast({
//         title: "Số tiền không hợp lệ",
//         description: "Vui lòng nhập số tiền quyên góp lớn hơn 0.",
//         variant: "destructive",
//       });
//       return;
//     }

//     donationMutation.mutate({
//       campaignId: campaign.id,
//       amount: amount,
//       type: donationType,
//       anonymous,
//     });
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle className="flex items-center">
//             <DollarSign className="w-5 h-5 mr-2 text-primary" />
//             Quyên góp cho chiến dịch
//           </DialogTitle>
//           <DialogDescription>Hãy chung tay ủng hộ và tạo nên sự khác biệt</DialogDescription>
//         </DialogHeader>

//         <div className="mb-6">
//           <h4 className="font-medium text-neutral-900 mb-2">{campaign.title}</h4>
//           <p className="text-sm text-neutral-600">{campaign.description.substring(0, 100)}...</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <Label className="text-sm font-medium text-neutral-700 mb-2 block">Số tiền quyên góp</Label>
//             <div className="grid grid-cols-3 gap-2 mb-3">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => handleQuickAmount(100000)}
//                 className="py-2 px-4 text-sm"
//               >
//                 100.000₫
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => handleQuickAmount(200000)}
//                 className="py-2 px-4 text-sm"
//               >
//                 200.000₫
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => handleQuickAmount(500000)}
//                 className="py-2 px-4 text-sm"
//               >
//                 500.000₫
//               </Button>
//             </div>
//             <div className="relative">
//               <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
//               <Input
//                 type="number"
//                 min="1000"
//                 step="1000"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="Nhập số tiền (VND)"
//                 className="pl-10"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <Label className="text-sm font-medium text-neutral-700 mb-2 block">Hình thức quyên góp</Label>
//             <RadioGroup value={donationType} onValueChange={setDonationType}>
//               <div className="grid grid-cols-2 gap-2">
//                 <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-neutral-50">
//                   <RadioGroupItem value="money" className="mr-2" />
//                   <div>
//                     <div className="font-medium text-sm">Tiền mặt</div>
//                     <div className="text-xs text-neutral-600">Quyên góp bằng tiền</div>
//                   </div>
//                 </label>
//                 <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-neutral-50">
//                   <RadioGroupItem value="goods" className="mr-2" />
//                   <div>
//                     <div className="font-medium text-sm">Hiện vật</div>
//                     <div className="text-xs text-neutral-600">Quyên góp vật phẩm</div>
//                   </div>
//                 </label>
//               </div>
//             </RadioGroup>
//           </div>

//           <div className="flex items-center space-x-2">
//             <Checkbox
//               id="anonymous"
//               checked={anonymous}
//               onCheckedChange={(checked) => setAnonymous(checked as boolean)}
//             />
//             <Label htmlFor="anonymous" className="text-sm text-neutral-600">
//               Ẩn danh khi quyên góp
//             </Label>
//           </div>

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={donationMutation.isPending}
//           >
//             {donationMutation.isPending ? "Đang xử lý..." : "Quyên góp ngay"}
//           </Button>
//         </form>

//         <div className="text-center mt-4">
//           <p className="text-xs text-neutral-500 flex items-center justify-center">
//             <Lock className="w-3 h-3 mr-1" />
//             Thanh toán an toàn, minh bạch 100%
//           </p>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Lock } from "lucide-react";
import { apiRequest } from "@/lib/api";
// Sử dụng import mặc định cho qrcode.react
import QRCode from "react-qr-code";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: number;
    title: string;
    description: string;
  };
}

export default function DonationModal({ isOpen, onClose, campaign }: DonationModalProps) {
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("money");
  const [anonymous, setAnonymous] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const donationMutation = useMutation({
    mutationFn: async (data: { campaignId: number; amount: string; type: string; anonymous: boolean }) => {
      const response = await apiRequest('POST', '/api/donations', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cảm ơn bạn đã ủng hộ!",
        description: "Khoản quyên góp của bạn đã được ghi nhận thành công. Bạn sẽ nhận được email xác nhận trong thời gian sớm nhất.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/donations/campaign/${campaign.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/donations/user/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
      setAmount("");
      setDonationType("money");
      setAnonymous(false);
      setShowQR(false);
      setTransactionId("");
      setSuccess(false);
    },
    onError: () => {
      toast({
        title: "Quyên góp thất bại",
        description: "Đã xảy ra lỗi khi xử lý quyên góp. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast({
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập số tiền quyên góp lớn hơn 0.",
        variant: "destructive",
      });
      return;
    }
    if (donationType === "money") {
      setShowQR(true);
    } else {
      donationMutation.mutate({
        campaignId: campaign.id,
        amount: amount,
        type: donationType,
        anonymous,
      });
    }
  };

  // Hàm kiểm tra giao dịch Momo (giả lập, cần backend thực tế)
  const handleCheckMomo = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/momo/check?transactionId=${transactionId}&amount=${amount}`);
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        // Gửi về backend để lưu lịch sử quyên góp
        donationMutation.mutate({
          campaignId: campaign.id,
          amount: amount,
          type: "money",
          anonymous,
        });
      } else {
        toast({
          title: "Chưa xác nhận được giao dịch",
          description: "Vui lòng kiểm tra lại mã giao dịch hoặc thử lại sau.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Lỗi xác nhận giao dịch",
        description: "Không thể kết nối đến hệ thống xác nhận Momo.",
        variant: "destructive",
      });
    }
    setChecking(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            Quyên góp cho chiến dịch
          </DialogTitle>
          <DialogDescription>Hãy chung tay ủng hộ và tạo nên sự khác biệt</DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <h4 className="font-medium text-neutral-900 mb-2">{campaign.title}</h4>
          <p className="text-sm text-neutral-600">{campaign.description.substring(0, 100)}...</p>
        </div>

        {!showQR && !success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-2 block">Số tiền quyên góp</Label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickAmount(100000)}
                  className="py-2 px-4 text-sm"
                >
                  100.000₫
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickAmount(200000)}
                  className="py-2 px-4 text-sm"
                >
                  200.000₫
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickAmount(500000)}
                  className="py-2 px-4 text-sm"
                >
                  500.000₫
                </Button>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
                <Input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền (VND)"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-2 block">Hình thức quyên góp</Label>
              <RadioGroup value={donationType} onValueChange={setDonationType}>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <RadioGroupItem value="money" className="mr-2" />
                    <div>
                      <div className="font-medium text-sm">Tiền mặt / Chuyển khoản</div>
                      <div className="text-xs text-neutral-600">Quyên góp bằng tiền</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <RadioGroupItem value="goods" className="mr-2" />
                    <div>
                      <div className="font-medium text-sm">Hiện vật</div>
                      <div className="text-xs text-neutral-600">Quyên góp vật phẩm</div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={anonymous}
                onCheckedChange={(checked) => setAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="text-sm text-neutral-600">
                Ẩn danh khi quyên góp
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={donationMutation.isPending}
            >
              {donationMutation.isPending ? "Đang xử lý..." : "Quyên góp ngay"}
            </Button>
          </form>
        )}

        {/* QR Momo */}
        {showQR && !success && (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div>
              <QRCode
                value={`2|99|0945206559||||0|0`}
                size={200}
              />
            </div>
            <div className="text-sm text-neutral-600 text-center">
              Quét mã QR bằng app Momo để chuyển khoản.<br />
              <b>Lưu ý:</b> Ghi rõ nội dung chuyển khoản: <span className="font-mono bg-gray-100 px-2 py-1 rounded">Ung ho {campaign.title}</span>
            </div>
            <Input
              placeholder="Nhập mã giao dịch Momo sau khi chuyển khoản"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              className="mt-2"
              required
            />
            <Button type="button" className="w-full" onClick={handleCheckMomo} disabled={checking || !transactionId}>
              {checking ? "Đang kiểm tra..." : "Xác nhận đã chuyển khoản"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowQR(false)}>
              Quay lại
            </Button>
          </div>
        )}

        {success && (
          <div className="text-center text-green-600 font-semibold py-8">
            Cảm ơn bạn đã quyên góp! Giao dịch đã được xác nhận.
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-xs text-neutral-500 flex items-center justify-center">
            <Lock className="w-3 h-3 mr-1" />
            Thanh toán an toàn, minh bạch 100%
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}