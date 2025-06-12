// import { useQuery } from "@tanstack/react-query";
// import { Link } from "wouter";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Heart, DollarSign, TrendingUp, User } from "lucide-react";
// import { apiRequest } from "@/lib/api";
// import { useAuth } from "@/hooks/useAuth";

// export default function UserDashboard() {
//   const { user } = useAuth();
//   const [tab, setTab] = useState<"donations" | "campaigns">("donations");

//   const { data: donations, isLoading: isDonationsLoading } = useQuery({
//     queryKey: ["/api/donations/user/me"],
//     queryFn: async () => {
//       const response = await apiRequest('GET', '/api/donations/user/me');
//       return response.json();
//     },
//   });

//   const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
//     queryKey: ["/api/campaigns"],
//     queryFn: async () => {
//       const response = await fetch('/api/campaigns');
//       return response.json();
//     },
//   });

//   if (isDonationsLoading || isCampaignsLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   const totalDonated = donations?.reduce((sum: number, donation: any) => sum + parseFloat(donation.amount), 0) || 0;
//   const campaignsSupported = new Set(donations?.map((d: any) => d.campaignId)).size || 0;

//   // Lọc ra các campaign do user này tạo (nếu user là tổ chức)
//   const myCampaigns = campaigns?.filter(
//     (c: any) => c.organization?.userId === user?.id
//   ) || [];

//   // Gợi ý chiến dịch (ví dụ lấy 3 chiến dịch đầu)
//   const recommendedCampaigns = campaigns?.slice(0, 3) || [];

//   // Thông tin tổ chức mẫu (hoặc lấy từ user nếu có)
//   const orgStatus = user?.status || "approved";
//   const orgSuccessRate = user?.successRate || 85.5;
//   const orgRating = user?.rating || 4.5;
//   const orgCreatedAt = user?.createdAt || new Date();

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Facebook-style profile header */}
//       <div className="relative mb-8">
//         <div className="h-40 bg-primary/80 rounded-t-xl"></div>
//         <div className="absolute left-8 -bottom-16 flex items-end gap-6">
//           <div className="flex items-center gap-8 pb-4">
//             {/* Avatar + tên bên trái */}
//             <div className="flex items-center gap-6">
//               <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
//                 <User className="w-20 h-20 text-primary" />
//               </div>
//               <div>
//                 <h2 className="text-3xl font-bold text-neutral-900">{user?.firstName} {user?.lastName}</h2>
//                 <div className="text-neutral-600">{user?.email}</div>
//                 <div className="text-sm text-neutral-500 mt-1">
//                   Role: <span className="font-medium">{user?.role}</span>
//                 </div>
//               </div>
//             </div>
//             {/* Thông tin tổ chức bên phải, cùng hàng */}
//             {user?.role === "organization" && (
//   <div className="ml-12 grid grid-cols-2 gap-x-8 gap-y-1 text-sm min-w-[320px]">
//     {/* Status + Success Rate cùng hàng */}
//     <div className="flex items-center">
//       <span className="font-semibold">Status:</span>&nbsp;
//       <span className={`inline-block px-2 py-0.5 rounded ${orgStatus === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
//         {orgStatus.charAt(0).toUpperCase() + orgStatus.slice(1)}
//       </span>
//     </div>
//     <div className="flex items-center">
//       <span className="font-semibold">Success Rate:</span>&nbsp;
//       <span>{parseFloat(orgSuccessRate).toFixed(2)}%</span>
//     </div>
//     {/* Rating + Created At cùng hàng */}
//     <div className="flex items-center">
//       <span className="font-semibold">Rating:</span>&nbsp;
//       <span>{parseFloat(orgRating).toFixed(2)}</span>
//     </div>
//     <div className="flex items-center">
//       <span className="font-semibold">Created At:</span>&nbsp;
//       <span>{orgCreatedAt ? new Date(orgCreatedAt).toLocaleDateString() : ""}</span>
//     </div>
//   </div>
// )}
//           </div>
//         </div>
//       </div>
//       <div className="h-20" /> {/* Spacer for avatar overlay */}

//       {/* Tabs */}
//       <div className="flex border-b border-gray-200 mb-6">
//         <button
//           className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "donations" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
//           onClick={() => setTab("donations")}
//         >
//           Quyên góp
//         </button>
//         <button
//           className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "campaigns" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
//           onClick={() => setTab("campaigns")}
//         >
//           Chiến dịch
//         </button>
//       </div>

//       {/* Tab content */}
//       {tab === "donations" && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-xl font-semibold text-neutral-900">Quyên góp gần đây</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {donations && donations.length > 0 ? (
//               <div className="space-y-4">
//                 {donations.slice(0, 5).map((donation: any) => (
//                   <div key={donation.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
//                         <Heart className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium text-neutral-900">
//                           <Link 
//                             href={`/campaigns/${donation.campaignId}`}
//                             className="hover:text-primary transition-colors"
//                           >
//                             {donation.campaign.title}
//                           </Link>
//                         </h3>
//                         <p className="text-sm text-neutral-600">
//                           Ngày quyên góp: {new Date(donation.createdAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-semibold text-primary">
//                         ${Math.round(parseFloat(donation.amount))}
//                       </div>
//                       <Badge variant="secondary" className="text-xs">
//                         {donation.type}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-neutral-900 mb-2">Chưa có quyên góp nào</h3>
//                 <p className="text-neutral-600 mb-4">Hãy bắt đầu đóng góp cho một chiến dịch</p>
//                 <Button asChild>
//                   <Link href="/campaigns">Xem các chiến dịch</Link>
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {tab === "campaigns" && (
//         <div className="space-y-8">
//           {/* Chiến dịch đã tạo */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch đã tạo</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {myCampaigns.length > 0 ? (
//                 <div className="space-y-3">
//                   {myCampaigns.map((campaign: any) => (
//                     <div
//                       key={campaign.id}
//                       className="p-3 border border-gray-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
//                     >
//                       <Link href={`/campaigns/${campaign.id}`}>
//                         <h4 className="font-medium text-sm text-neutral-900 hover:text-primary transition-colors">
//                           {campaign.title}
//                         </h4>
//                         <p className="text-xs text-neutral-600 mt-1">
//                           {campaign.category?.name} • {campaign.organization?.name}
//                         </p>
//                       </Link>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-neutral-500">
//                   Bạn chưa tạo chiến dịch nào.
//                 </div>
//               )}
//               <Button variant="outline" className="w-full mt-4" asChild>
//                 <Link href="/campaigns/create">Tạo chiến dịch mới</Link>
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Chiến dịch gợi ý */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch gợi ý</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {recommendedCampaigns.map((campaign: any) => (
//                   <div
//                     key={campaign.id}
//                     className="p-3 border border-gray-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
//                   >
//                     <Link href={`/campaigns/${campaign.id}`}>
//                       <h4 className="font-medium text-sm text-neutral-900 hover:text-primary transition-colors">
//                         {campaign.title}
//                       </h4>
//                       <p className="text-xs text-neutral-600 mt-1">
//                         {campaign.category?.name} • {campaign.organization?.name}
//                       </p>
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//               <Button variant="outline" className="w-full mt-4" asChild>
//                 <Link href="/campaigns">Xem tất cả chiến dịch</Link>
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Impact Summary */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold text-neutral-900">Tác động của bạn</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="text-center p-4 bg-primary/5 rounded-lg">
//               <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
//               <div className="text-2xl font-bold text-primary">${Math.round(totalDonated)}</div>
//               <div className="text-sm text-neutral-600">Tổng số tiền đã quyên góp</div>
//             </div>
//             <div className="text-center p-4 bg-secondary/5 rounded-lg">
//               <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
//               <div className="text-2xl font-bold text-secondary">{campaignsSupported}</div>
//               <div className="text-sm text-neutral-600">Chiến dịch đã ủng hộ</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, DollarSign, TrendingUp, User, Pencil } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function UserDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"donations" | "campaigns">("donations");
  const [showEdit, setShowEdit] = useState(false);

  const { data: donations, isLoading: isDonationsLoading } = useQuery({
    queryKey: ["/api/donations/user/me"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/donations/user/me');
      return response.json();
    },
  });

  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      return response.json();
    },
  });

  if (isDonationsLoading || isCampaignsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalDonated = donations?.reduce((sum: number, donation: any) => sum + parseFloat(donation.amount), 0) || 0;
  const campaignsSupported = new Set(donations?.map((d: any) => d.campaignId)).size || 0;

  // Lọc ra các campaign do user này tạo (nếu user là tổ chức)
  const myCampaigns = campaigns?.filter(
    (c: any) => c.organization?.userId === user?.id
  ) || [];

  // Gợi ý chiến dịch (ví dụ lấy 3 chiến dịch đầu)
  const recommendedCampaigns = campaigns?.slice(0, 3) || [];

  // Thông tin tổ chức mẫu (hoặc lấy từ user nếu có)
  const orgStatus = user?.status || "approved";
  const orgSuccessRate = user?.successRate || 85.5;
  const orgRating = user?.rating || 4.5;
  const orgCreatedAt = user?.createdAt || new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Facebook-style profile header */}
      <div className="relative mb-8">
        <div className="h-40 bg-primary/80 rounded-t-xl"></div>
        <div className="absolute left-8 -bottom-16 flex items-end gap-6">
          <div className="flex items-center gap-8 pb-4">
            {/* Avatar + tên bên trái */}
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
                <User className="w-20 h-20 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold text-neutral-900">{user?.firstName} {user?.lastName}</h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-1"
                    aria-label="Chỉnh sửa thông tin"
                    onClick={() => setShowEdit(true)}
                  >
                    <Pencil className="w-5 h-5 text-primary" />
                  </Button>
                </div>
                <div className="text-neutral-600">{user?.email}</div>
                <div className="text-sm text-neutral-500 mt-1">
                  Role: <span className="font-medium">{user?.role}</span>
                </div>
              </div>
            </div>
            {/* Thông tin tổ chức bên phải, cùng hàng */}
            {user?.role === "organization" && (
              <div className="ml-12 grid grid-cols-2 gap-x-8 gap-y-1 text-sm min-w-[320px]">
                {/* Status + Success Rate cùng hàng */}
                <div className="flex items-center">
                  <span className="font-semibold">Status:</span>&nbsp;
                  <span className={`inline-block px-2 py-0.5 rounded ${orgStatus === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {orgStatus.charAt(0).toUpperCase() + orgStatus.slice(1)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">Success Rate:</span>&nbsp;
                  <span>{parseFloat(orgSuccessRate).toFixed(2)}%</span>
                </div>
                {/* Rating + Created At cùng hàng */}
                <div className="flex items-center">
                  <span className="font-semibold">Rating:</span>&nbsp;
                  <span>{parseFloat(orgRating).toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">Created At:</span>&nbsp;
                  <span>{orgCreatedAt ? new Date(orgCreatedAt).toLocaleDateString() : ""}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-20" /> {/* Spacer for avatar overlay */}

      {/* Modal chỉnh sửa thông tin cá nhân (ví dụ, bạn có thể thay bằng Dialog thực tế của bạn) */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[320px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowEdit(false)}
              aria-label="Đóng"
            >
              ×
            </button>     
<form
  className="space-y-4"
  onSubmit={async (e) => {
    e.preventDefault();
    // Lấy dữ liệu từ form
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // Nếu là tổ chức thì lấy thêm name, description
    const orgName = formData.get("orgName") as string;
    const orgDescription = formData.get("orgDescription") as string;

    // Gọi API cập nhật user
    await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        ...(password ? { password } : {}),
      }),
    });

    // Nếu là tổ chức thì gọi API cập nhật tổ chức
    if (user?.role === "organization") {
      await fetch("/api/organizations/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName,
          description: orgDescription,
        }),
      });
    }

    // Đóng modal và reload lại thông tin
    setShowEdit(false);
    window.location.reload();
  }}
>
  <div>
    <label className="block font-medium mb-1">Họ</label>
    <input
      name="firstName"
      defaultValue={user?.firstName}
      className="w-full border rounded px-3 py-2"
      required
    />
  </div>
  <div>
    <label className="block font-medium mb-1">Tên</label>
    <input
      name="lastName"
      defaultValue={user?.lastName}
      className="w-full border rounded px-3 py-2"
      required
    />
  </div>
  <div>
    <label className="block font-medium mb-1">Email</label>
    <input
      name="email"
      type="email"
      defaultValue={user?.email}
      className="w-full border rounded px-3 py-2"
      required
    />
  </div>
  <div>
    <label className="block font-medium mb-1">Mật khẩu mới (nếu muốn đổi)</label>
    <input
      name="password"
      type="password"
      className="w-full border rounded px-3 py-2"
      placeholder="Để trống nếu không đổi"
    />
  </div>
  {user?.role === "organization" && (
    <>
      <div>
        <label className="block font-medium mb-1">Tên tổ chức</label>
        <input
          name="orgName"
          defaultValue={user.organization?.name}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Mô tả tổ chức</label>
        <textarea
          name="orgDescription"
          defaultValue={user.organization?.description}
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        />
      </div>
    </>
  )}
  <div className="flex justify-end gap-2 mt-4">
    <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>
      Hủy
    </Button>
    <Button type="submit" className="bg-primary text-white">
      Lưu thay đổi
    </Button>
  </div>
</form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "donations" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
          onClick={() => setTab("donations")}
        >
          Quyên góp
        </button>
        <button
          className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "campaigns" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
          onClick={() => setTab("campaigns")}
        >
          Chiến dịch
        </button>
      </div>

      {/* Tab content */}
      {tab === "donations" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-neutral-900">Quyên góp gần đây</CardTitle>
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
                          Ngày quyên góp: {new Date(donation.createdAt).toLocaleDateString()}
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
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Chưa có quyên góp nào</h3>
                <p className="text-neutral-600 mb-4">Hãy bắt đầu đóng góp cho một chiến dịch</p>
                <Button asChild>
                  <Link href="/campaigns">Xem các chiến dịch</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "campaigns" && (
        <div className="space-y-8">
          {/* Chiến dịch đã tạo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch đã tạo</CardTitle>
            </CardHeader>
            <CardContent>
              {myCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {myCampaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                    >
                      <Link href={`/campaigns/${campaign.id}`}>
                        <h4 className="font-medium text-sm text-neutral-900 hover:text-primary transition-colors">
                          {campaign.title}
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1">
                          {campaign.category?.name} • {campaign.organization?.name}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  Bạn chưa tạo chiến dịch nào.
                </div>
              )}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/campaigns/create">Tạo chiến dịch mới</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Chiến dịch gợi ý */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch gợi ý</CardTitle>
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
                        {campaign.category?.name} • {campaign.organization?.name}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/campaigns">Xem tất cả chiến dịch</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-900">Tác động của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">${Math.round(totalDonated)}</div>
              <div className="text-sm text-neutral-600">Tổng số tiền đã quyên góp</div>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary">{campaignsSupported}</div>
              <div className="text-sm text-neutral-600">Chiến dịch đã ủng hộ</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}