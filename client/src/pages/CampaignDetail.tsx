// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useParams, Link } from "wouter";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import DonationModal from "@/components/DonationModal";
// import { CheckCircle, Heart, Share, Star, Eye } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// export default function CampaignDetail() {
//   const { id } = useParams();
//   const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
//   const { isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   // State cho dialog xem tất cả cập nhật
//   const [openAllUpdates, setOpenAllUpdates] = useState(false);

//   const { data: campaign, isLoading } = useQuery({
//     queryKey: [`/api/campaigns/${id}`],
//     queryFn: async () => {
//       const response = await fetch(`/api/campaigns/${id}`);
//       return response.json();
//     },
//   });

//   const { data: donations } = useQuery({
//     queryKey: [`/api/donations/campaign/${id}`],
//     queryFn: async () => {
//       const response = await fetch(`/api/donations/campaign/${id}`);
//       return response.json();
//     },
//   });

//   const { data: updates } = useQuery({
//     queryKey: [`/api/campaign-updates/${id}`],
//     queryFn: async () => {
//       const response = await fetch(`/api/campaign-updates/${id}`);
//       return response.json();
//     },
//   });

//   const shareMutation = useMutation({
//     mutationFn: async () => {
//       if (navigator.share) {
//         await navigator.share({
//           title: campaign?.title,
//           text: campaign?.description,
//           url: window.location.href,
//         });
//       } else {
//         await navigator.clipboard.writeText(window.location.href);
//         toast({
//           title: "Đã sao chép liên kết!",
//           description: "Đường dẫn chiến dịch đã được sao chép.",
//         });
//       }
//     },
//     onError: () => {
//       toast({
//         title: "Không thể chia sẻ",
//         description: "Vui lòng sao chép URL thủ công.",
//         variant: "destructive",
//       });
//     },
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!campaign) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-neutral-900 mb-4">Không tìm thấy chiến dịch</h1>
//           <Button asChild>
//             <Link href="/campaigns">Quay lại danh sách chiến dịch</Link>
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const progressPercentage = Math.round((parseFloat(campaign.raised) / parseFloat(campaign.target)) * 100);
//   const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Nội dung chính */}
//         <div className="lg:col-span-2">
//           <img
//             src={campaign.imageUrl || "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600"}
//             alt={campaign.title}
//             className="w-full h-96 object-cover rounded-xl mb-6"
//           />

//           <Card className="mb-6">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <Badge variant="secondary" className="bg-accent/10 text-accent">
//                   {campaign.category.name}
//                 </Badge>
//                 <div className="flex items-center text-secondary">
//                   <CheckCircle className="w-4 h-4 mr-1" />
//                   <span className="text-sm font-medium">Chiến dịch đã xác thực</span>
//                 </div>
//               </div>

//               <h1 className="text-3xl font-bold text-neutral-900 mb-4">{campaign.title}</h1>

//               <div className="prose max-w-none text-neutral-700">
//                 <p>{campaign.description}</p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Cập nhật chiến dịch */}
//           {updates && updates.length > 0 && (
//             <Card className="mb-6">
//               <CardHeader>
//                 <h2 className="text-xl font-semibold text-neutral-900">Cập nhật chiến dịch</h2>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="space-y-6">
//                   {/* Hiển thị tóm tắt cập nhật mới nhất */}
//                   <div className="border-l-4 border-primary pl-4 pb-4 bg-neutral-50 rounded">
//                     <div className="text-sm text-neutral-600 mb-1">
//                       {new Date(updates[0].createdAt).toLocaleDateString()}
//                     </div>
//                     <h3 className="font-medium text-neutral-900">{updates[0].title}</h3>
//                     <p className="text-sm text-neutral-700 mt-2">
//                       {updates[0].content.length > 200 ? updates[0].content.slice(0, 200) + "..." : updates[0].content}
//                     </p>
//                     {updates[0].imageUrls && updates[0].imageUrls.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {updates[0].imageUrls.slice(0, 3).map((url: string, idx: number) => (
//                           <img
//                             key={idx}
//                             src={url}
//                             alt={`Ảnh cập nhật ${idx + 1}`}
//                             className="w-20 h-20 object-cover rounded border"
//                           />
//                         ))}
//                         {updates[0].imageUrls.length > 3 && (
//                           <span className="text-xs text-neutral-500 ml-2">+{updates[0].imageUrls.length - 3} ảnh</span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   {/* Nút xem tất cả cập nhật */}
//                   <Dialog open={openAllUpdates} onOpenChange={setOpenAllUpdates}>
//                     <DialogTrigger asChild>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="mt-2"
//                         onClick={() => setOpenAllUpdates(true)}
//                       >
//                         <Eye className="w-4 h-4 mr-1" />
//                         Xem tất cả cập nhật
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//                       <DialogHeader>
//                         <DialogTitle>Tất cả cập nhật chiến dịch</DialogTitle>
//                       </DialogHeader>
//                       <div className="space-y-8 mt-2">
//                         {updates.map((update: any) => (
//                           <div key={update.id} className="border-l-4 border-primary pl-4 pb-4 bg-neutral-50 rounded">
//                             <div className="text-xs text-neutral-500 mb-1">
//                               {new Date(update.createdAt).toLocaleString()}
//                             </div>
//                             <h3 className="font-semibold text-neutral-900">{update.title}</h3>
//                             <div className="text-sm text-neutral-700 mt-2 whitespace-pre-line">{update.content}</div>
//                             {update.imageUrls && update.imageUrls.length > 0 && (
//                               <div className="flex flex-wrap gap-2 mt-2">
//                                 {update.imageUrls.map((url: string, idx: number) => (
//                                   <img
//                                     key={idx}
//                                     src={url}
//                                     alt={`Ảnh cập nhật ${idx + 1}`}
//                                     className="w-24 h-24 object-cover rounded border"
//                                   />
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Thông tin tổ chức */}
//           <Card>
//             <CardHeader>
//               <h2 className="text-xl font-semibold text-neutral-900">Về tổ chức {campaign.organization.name}</h2>
//             </CardHeader>
//             <CardContent className="p-6">
//               <div className="flex items-start">
//                 <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
//                   <Heart className="w-8 h-8 text-white" />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-semibold text-neutral-900 mb-2">{campaign.organization.name}</h3>
//                   <div className="flex items-center mb-2">
//                     <div className="flex text-yellow-400 mr-2">
//                       {[...Array(5)].map((_, i) => (
//                         <Star key={i} className="w-4 h-4 fill-current" />
//                       ))}
//                     </div>
//                     <span className="text-sm text-neutral-600">
//                       {campaign.organization.rating || 0}/5 điểm • {campaign.organization.successRate || 0}% thành công
//                     </span>
//                   </div>
//                   <p className="text-sm text-neutral-700">{campaign.organization.description}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sidebar */}
//         <div>
//           <Card className="mb-6 sticky top-24">
//             <CardContent className="p-6">
//               <div className="mb-6">
//                 <div className="text-3xl font-bold text-primary mb-2">
//                   {Math.round(parseFloat(campaign.raised)).toLocaleString()}₫
//                 </div>
//                 <div className="text-neutral-600 mb-1">
//                   đã gây quỹ / {Math.round(parseFloat(campaign.target)).toLocaleString()}₫ mục tiêu
//                 </div>
//                 <Progress value={progressPercentage} className="mb-4" />

//                 <div className="grid grid-cols-2 gap-4 text-center">
//                   <div>
//                     <div className="text-lg font-semibold text-neutral-900">{donations?.length || 0}</div>
//                     <div className="text-sm text-neutral-600">Nhà hảo tâm</div>
//                   </div>
//                   <div>
//                     <div className="text-lg font-semibold text-neutral-900">{Math.max(0, daysLeft)}</div>
//                     <div className="text-sm text-neutral-600">Ngày còn lại</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <Button
//                   className="w-full"
//                   onClick={() => {
//                     if (!isAuthenticated) {
//                       toast({
//                         title: "Vui lòng đăng nhập",
//                         description: "Bạn cần đăng nhập để quyên góp.",
//                         variant: "destructive",
//                       });
//                       return;
//                     }
//                     setIsDonationModalOpen(true);
//                   }}
//                 >
//                   <Heart className="w-4 h-4 mr-2" />
//                   Quyên góp ngay
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   onClick={() => shareMutation.mutate()}
//                   disabled={shareMutation.isPending}
//                 >
//                   <Share className="w-4 h-4 mr-2" />
//                   Chia sẻ chiến dịch
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Nhà hảo tâm gần đây */}
//           {donations && donations.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <h3 className="text-lg font-semibold text-neutral-900">Nhà hảo tâm gần đây</h3>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="space-y-3">
//                   {donations.slice(0, 5).map((donation: any) => (
//                     <div key={donation.id} className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
//                           <span className="text-white text-sm font-semibold">
//                             {donation.anonymous ? 'A' : donation.user.firstName[0]}
//                           </span>
//                         </div>
//                         <div>
//                           <div className="font-medium text-sm text-neutral-900">
//                             {donation.anonymous ? 'Ẩn danh' : `${donation.user.firstName} ${donation.user.lastName}`}
//                           </div>
//                           <div className="text-xs text-neutral-600">
//                             {new Date(donation.createdAt).toLocaleDateString()}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="font-semibold text-primary">
//                         {Math.round(parseFloat(donation.amount)).toLocaleString()}₫
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//       <DonationModal
//         isOpen={isDonationModalOpen}
//         onClose={() => setIsDonationModalOpen(false)}
//         campaign={campaign}
//       />
//     </div>
//   );
// }



// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useParams, Link } from "wouter";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import DonationModal from "@/components/DonationModal";
// import { CheckCircle, Heart, Share, Star, Eye } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Star } from "lucide-react";
// import { useEffect } from "react";
// export default function CampaignDetail() {
//   const { id } = useParams();
//   const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
//   const { isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [userRating, setUserRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [ratings, setRatings] = useState<any[]>([]);
//   const [loadingRatings, setLoadingRatings] = useState(true);

//   // State cho dialog xem tất cả cập nhật
//   const [openAllUpdates, setOpenAllUpdates] = useState(false);
//   useEffect(() => {
//   fetch(`/api/campaigns/${id}/ratings`)
//     .then(res => res.json())
//     .then(setRatings)
//     .finally(() => setLoadingRatings(false));
// }, [id]);


//   const { data: campaign, isLoading } = useQuery({
//     queryKey: [`/api/campaigns/${id}`],
//     queryFn: async () => {
//       const response = await fetch(`/api/campaigns/${id}`);
//       return response.json();
//     },
//   });

//   const { data: donations } = useQuery({
//     queryKey: [`/api/donations/campaign/${id}`],
//     queryFn: async () => {
//       const response = await fetch(`/api/donations/campaign/${id}`);
//       return response.json();
//     },
//   });

//   const { data: updates } = useQuery({
//     queryKey: [`/api/campaign-updates/${id}`],
//     queryFn: async () => {
//       const response = await fetch(`/api/campaign-updates/${id}`);
//       return response.json();
//     },
//   });

//   const shareMutation = useMutation({
//     mutationFn: async () => {
//       if (navigator.share) {
//         await navigator.share({
//           title: campaign?.title,
//           text: campaign?.description,
//           url: window.location.href,
//         });
//       } else {
//         await navigator.clipboard.writeText(window.location.href);
//         toast({
//           title: "Đã sao chép liên kết!",
//           description: "Đường dẫn chiến dịch đã được sao chép.",
//         });
//       }
//     },
//     onError: () => {
//       toast({
//         title: "Không thể chia sẻ",
//         description: "Vui lòng sao chép URL thủ công.",
//         variant: "destructive",
//       });
//     },
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!campaign) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-neutral-900 mb-4">Không tìm thấy chiến dịch</h1>
//           <Button asChild>
//             <Link href="/campaigns">Quay lại danh sách chiến dịch</Link>
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const progressPercentage = Math.round((parseFloat(campaign.raised) / parseFloat(campaign.target)) * 100);
//   const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Nội dung chính */}
//         <div className="lg:col-span-2">
//           <img
//             src={campaign.imageUrl || "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600"}
//             alt={campaign.title}
//             className="w-full h-96 object-cover rounded-xl mb-6"
//           />

//           <Card className="mb-6">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <Badge variant="secondary" className="bg-accent/10 text-accent">
//                   {campaign.category.name}
//                 </Badge>
//                 <div className="flex items-center text-secondary">
//                   <CheckCircle className="w-4 h-4 mr-1" />
//                   <span className="text-sm font-medium">Chiến dịch đã xác thực</span>
//                 </div>
//               </div>

//               <h1 className="text-3xl font-bold text-neutral-900 mb-4">{campaign.title}</h1>

//               <div className="prose max-w-none text-neutral-700">
//                 <p>{campaign.description}</p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Cập nhật chiến dịch */}
//           {updates && updates.length > 0 && (
//             <Card className="mb-6">
//               <CardHeader>
//                 <h2 className="text-xl font-semibold text-neutral-900">Cập nhật chiến dịch</h2>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="space-y-6">
//                   {/* Hiển thị tóm tắt cập nhật mới nhất */}
//                   <div className="border-l-4 border-primary pl-4 pb-4 bg-neutral-50 rounded">
//                     <div className="text-sm text-neutral-600 mb-1">
//                       {new Date(updates[0].createdAt).toLocaleDateString()}
//                     </div>
//                     <h3 className="font-medium text-neutral-900">{updates[0].title}</h3>
//                     <p className="text-sm text-neutral-700 mt-2">
//                       {updates[0].content.length > 200 ? updates[0].content.slice(0, 200) + "..." : updates[0].content}
//                     </p>
//                     {updates[0].imageUrls && updates[0].imageUrls.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {updates[0].imageUrls.slice(0, 3).map((url: string, idx: number) => (
//                           <img
//                             key={idx}
//                             src={url}
//                             alt={`Ảnh cập nhật ${idx + 1}`}
//                             className="w-20 h-20 object-cover rounded border"
//                           />
//                         ))}
//                         {updates[0].imageUrls.length > 3 && (
//                           <span className="text-xs text-neutral-500 ml-2">+{updates[0].imageUrls.length - 3} ảnh</span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   {/* Nút xem tất cả cập nhật */}
//                   <Dialog open={openAllUpdates} onOpenChange={setOpenAllUpdates}>
//                     <DialogTrigger asChild>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="mt-2"
//                         onClick={() => setOpenAllUpdates(true)}
//                       >
//                         <Eye className="w-4 h-4 mr-1" />
//                         Xem tất cả cập nhật
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//                       <DialogHeader>
//                         <DialogTitle>Tất cả cập nhật chiến dịch</DialogTitle>
//                       </DialogHeader>
//                       <div className="space-y-8 mt-2">
//                         {updates.map((update: any) => (
//                           <div key={update.id} className="border-l-4 border-primary pl-4 pb-4 bg-neutral-50 rounded">
//                             <div className="text-xs text-neutral-500 mb-1">
//                               {new Date(update.createdAt).toLocaleString()}
//                             </div>
//                             <h3 className="font-semibold text-neutral-900">{update.title}</h3>
//                             <div className="text-sm text-neutral-700 mt-2 whitespace-pre-line">{update.content}</div>
//                             {update.imageUrls && update.imageUrls.length > 0 && (
//                               <div className="flex flex-wrap gap-2 mt-2">
//                                 {update.imageUrls.map((url: string, idx: number) => (
//                                   <img
//                                     key={idx}
//                                     src={url}
//                                     alt={`Ảnh cập nhật ${idx + 1}`}
//                                     className="w-24 h-24 object-cover rounded border"
//                                   />
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Thông tin tổ chức */}
//           <Card>
//             <CardHeader>
//               <h2 className="text-xl font-semibold text-neutral-900">Về tổ chức {campaign.organization.name}</h2>
//             </CardHeader>
//             <CardContent className="p-6">
//               <div className="flex items-start">
//                 <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
//                   <Heart className="w-8 h-8 text-white" />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-semibold text-neutral-900 mb-2">{campaign.organization.name}</h3>
//                   <div className="flex items-center mb-2">
//                     <div className="flex text-yellow-400 mr-2">
//                       {[...Array(5)].map((_, i) => (
//                         <Star key={i} className="w-4 h-4 fill-current" />
//                       ))}
//                     </div>
//                     <span className="text-sm text-neutral-600">
//                       {campaign.organization.rating || 0}/5 điểm • {campaign.organization.successRate || 0}% thành công
//                     </span>
//                   </div>
//                   <p className="text-sm text-neutral-700">{campaign.organization.description}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sidebar */}
//         <div>
//           <Card className="mb-6 sticky top-24">
//             <CardContent className="p-6">
//               <div className="mb-6">
//                 <div className="text-3xl font-bold text-primary mb-2">
//                   {Math.round(parseFloat(campaign.raised)).toLocaleString()}₫
//                 </div>
//                 <div className="text-neutral-600 mb-1">
//                   đã gây quỹ / {Math.round(parseFloat(campaign.target)).toLocaleString()}₫ mục tiêu
//                 </div>
//                 <Progress value={progressPercentage} className="mb-4" />

//                 <div className="grid grid-cols-2 gap-4 text-center">
//                   <div>
//                     <div className="text-lg font-semibold text-neutral-900">{donations?.length || 0}</div>
//                     <div className="text-sm text-neutral-600">Nhà hảo tâm</div>
//                   </div>
//                   <div>
//                     <div className="text-lg font-semibold text-neutral-900">{Math.max(0, daysLeft)}</div>
//                     <div className="text-sm text-neutral-600">Ngày còn lại</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <Button
//                   className="w-full"
//                   onClick={() => {
//                     if (!isAuthenticated) {
//                       toast({
//                         title: "Vui lòng đăng nhập",
//                         description: "Bạn cần đăng nhập để quyên góp.",
//                         variant: "destructive",
//                       });
//                       return;
//                     }
//                     setIsDonationModalOpen(true);
//                   }}
//                 >
//                   <Heart className="w-4 h-4 mr-2" />
//                   Quyên góp ngay
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   onClick={() => shareMutation.mutate()}
//                   disabled={shareMutation.isPending}
//                 >
//                   <Share className="w-4 h-4 mr-2" />
//                   Chia sẻ chiến dịch
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Nhà hảo tâm gần đây */}
//           {donations && donations.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <h3 className="text-lg font-semibold text-neutral-900">Nhà hảo tâm gần đây</h3>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="space-y-3">
//                   {donations.slice(0, 5).map((donation: any) => (
//                     <div key={donation.id} className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
//                           <span className="text-white text-sm font-semibold">
//                             {donation.anonymous ? 'A' : donation.user.firstName[0]}
//                           </span>
//                         </div>
//                         <div>
//                           <div className="font-medium text-sm text-neutral-900">
//                             {donation.anonymous ? 'Ẩn danh' : `${donation.user.firstName} ${donation.user.lastName}`}
//                           </div>
//                           <div className="text-xs text-neutral-600">
//                             {new Date(donation.createdAt).toLocaleDateString()}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="font-semibold text-primary">
//                         {Math.round(parseFloat(donation.amount)).toLocaleString()}₫
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//       <DonationModal
//         isOpen={isDonationModalOpen}
//         onClose={() => setIsDonationModalOpen(false)}
//         campaign={campaign}
//       />
//     </div>
//   );
// }



import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DonationModal from "@/components/DonationModal";
import { CheckCircle, Heart, Share, Star, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useEffect } from "react";
export default function CampaignDetail() {
  const { id } = useParams();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  // State cho dialog xem tất cả cập nhật
  const [openAllUpdates, setOpenAllUpdates] = useState(false);
  useEffect(() => {
  fetch(`/api/campaigns/${id}/ratings`)
    .then(res => res.json())
    .then(setRatings)
    .finally(() => setLoadingRatings(false));
}, [id]);


  const { data: campaign, isLoading } = useQuery({
    queryKey: [`/api/campaigns/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${id}`);
      return response.json();
    },
  });

  const { data: donations } = useQuery({
    queryKey: [`/api/donations/campaign/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/donations/campaign/${id}`);
      return response.json();
    },
  });

  const { data: updates } = useQuery({
    queryKey: [`/api/campaign-updates/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/campaign-updates/${id}`);
      return response.json();
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (navigator.share) {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Đã sao chép liên kết!",
          description: "Đường dẫn chiến dịch đã được sao chép.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Không thể chia sẻ",
        description: "Vui lòng sao chép URL thủ công.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Không tìm thấy chiến dịch</h1>
          <Button asChild>
            <Link href="/campaigns">Quay lại danh sách chiến dịch</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round((parseFloat(campaign.raised) / parseFloat(campaign.target)) * 100);
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nội dung chính */}
        
        <div className="lg:col-span-2">
          <img
            src={campaign.imageUrl || "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600"}
            alt={campaign.title}
            className="w-full h-96 object-cover rounded-xl mb-6"
          />

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  {campaign.category.name}
                </Badge>
                <div className="flex items-center text-secondary">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Chiến dịch đã xác thực</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-neutral-900 mb-4">{campaign.title}</h1>

              <div className="prose max-w-none text-neutral-700">
                <p>{campaign.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cập nhật chiến dịch */}
          {updates && updates.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-neutral-900">Cập nhật chiến dịch</h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Hiển thị tóm tắt cập nhật mới nhất */}
                  <div className="border-l-4 border-primary pl-4 pb-4 bg-neutral-50 rounded">
                    <div className="text-sm text-neutral-600 mb-1">
                      {new Date(updates[0].createdAt).toLocaleDateString()}
                    </div>
                    <h3 className="font-medium text-neutral-900">{updates[0].title}</h3>
                    <p className="text-sm text-neutral-700 mt-2">
                      {updates[0].content.length > 200 ? updates[0].content.slice(0, 200) + "..." : updates[0].content}
                    </p>
                    {updates[0].imageUrls && updates[0].imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {updates[0].imageUrls.slice(0, 3).map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Ảnh cập nhật ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ))}
                        {updates[0].imageUrls.length > 3 && (
                          <span className="text-xs text-neutral-500 ml-2">+{updates[0].imageUrls.length - 3} ảnh</span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Nút xem tất cả cập nhật */}
                  <Dialog open={openAllUpdates} onOpenChange={setOpenAllUpdates}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setOpenAllUpdates(true)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem tất cả cập nhật
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tất cả cập nhật chiến dịch</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-8 mt-2">
                        {updates.map((update: any) => (
                          <div key={update.id} className="border-l-4 border-primary pl-4 pb-4 bg-neutral-50 rounded">
                            <div className="text-xs text-neutral-500 mb-1">
                              {new Date(update.createdAt).toLocaleString()}
                            </div>
                            <h3 className="font-semibold text-neutral-900">{update.title}</h3>
                            <div className="text-sm text-neutral-700 mt-2 whitespace-pre-line">{update.content}</div>
                            {update.imageUrls && update.imageUrls.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {update.imageUrls.map((url: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`Ảnh cập nhật ${idx + 1}`}
                                    className="w-24 h-24 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Thông tin tổ chức */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-neutral-900">Về tổ chức {campaign.organization.name}</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-2">{campaign.organization.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">
                      {campaign.organization.rating || 0}/5 điểm • {campaign.organization.successRate || 0}% thành công
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700">{campaign.organization.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="mb-6 sticky top-24">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round(parseFloat(campaign.raised)).toLocaleString()}₫
                </div>
                <div className="text-neutral-600 mb-1">
                  đã gây quỹ / {Math.round(parseFloat(campaign.target)).toLocaleString()}₫ mục tiêu
                </div>
                <Progress value={progressPercentage} className="mb-4" />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">{donations?.length || 0}</div>
                    <div className="text-sm text-neutral-600">Nhà hảo tâm</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">{Math.max(0, daysLeft)}</div>
                    <div className="text-sm text-neutral-600">Ngày còn lại</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast({
                        title: "Vui lòng đăng nhập",
                        description: "Bạn cần đăng nhập để quyên góp.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setIsDonationModalOpen(true);
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Quyên góp ngay
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => shareMutation.mutate()}
                  disabled={shareMutation.isPending}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Chia sẻ chiến dịch
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nhà hảo tâm gần đây */}
          {donations && donations.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-neutral-900">Nhà hảo tâm gần đây</h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {donations.slice(0, 5).map((donation: any) => (
                    <div key={donation.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-semibold">
                            {donation.anonymous ? 'A' : donation.user.firstName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-neutral-900">
                            {donation.anonymous ? 'Ẩn danh' : `${donation.user.firstName} ${donation.user.lastName}`}
                          </div>
                          <div className="text-xs text-neutral-600">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-primary">
                        {Math.round(parseFloat(donation.amount)).toLocaleString()}₫
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={campaign}
      />
    </div>
  );
}