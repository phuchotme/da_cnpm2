import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, DollarSign, TrendingUp, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function OrganizationDetail() {
  const [match, params] = useRoute("/organizations/:id");
  const id = params?.id;
  const [org, setOrg] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"donations" | "campaigns">("donations");

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      try {
        // Lấy thông tin tổ chức hoặc user
        const orgRes = await fetch(`/api/organizations/${id}`);
        const orgData = await orgRes.json();
        setOrg(orgData);

        if (orgData.role === "user") {
          // Nếu là user, lấy donations của user này
          const donRes = await fetch(`/api/donations/user/${id}`);
          const dons = await donRes.json();
          setDonations(dons);
          setCampaigns([]); // Không có campaign
        } else {
          // Nếu là tổ chức, lấy các campaign và donations của campaign
          const campRes = await fetch(`/api/campaigns`);
          const allCampaigns = await campRes.json();
          const orgCampaigns = allCampaigns.filter((c: any) => c.organizationId === Number(id));
          setCampaigns(orgCampaigns);

          let allDonations: any[] = [];
          for (const campaign of orgCampaigns) {
            const donRes = await fetch(`/api/donations/campaign/${campaign.id}`);
            const dons = await donRes.json();
            allDonations = allDonations.concat(
              dons.map((d: any) => ({
                ...d,
                campaign: { title: campaign.title, id: campaign.id }
              }))
            );
          }
          setDonations(allDonations);
        }
      } catch (error) {
        setOrg(null);
        setCampaigns([]);
        setDonations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  if (!org)
    return (
      <p className="text-center text-red-500 font-semibold mt-10">
        Organization not found
      </p>
    );

  // Tổng số tiền đã quyên góp (user) hoặc đã nhận (tổ chức)
  const totalDonated = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  // Số chiến dịch đã nhận quyên góp (tổ chức) hoặc đã ủng hộ (user)
  const campaignsSupported = new Set(
    donations.map((d) => org.role === "user" ? d.campaignId : d.campaign?.id || d.campaignId)
  ).size;

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
                {org.role === "user" ? (
                  <User className="w-20 h-20 text-primary" />
                ) : (
                  <GraduationCap className="w-20 h-20 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-neutral-900">
                  {org.role === "user"
                    ? `${org.firstName || ""} ${org.lastName || ""}`
                    : org.name}
                </h2>
                <div className="text-neutral-600">
                  {org.role === "user" ? org.email : org.description}
                </div>
                {org.role === "user" && (
                  <div className="text-sm text-neutral-500 mt-1">
                    Role: <span className="font-medium">{org.role}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Thông tin tổ chức bên phải, cùng hàng */}
            {org.role !== "user" && (
              <div className="ml-12 grid grid-cols-2 gap-x-8 gap-y-1 text-sm min-w-[320px]">
                <div className="flex items-center">
                  <span className="font-semibold">Status:</span>&nbsp;
                  <span className={`inline-block px-2 py-0.5 rounded ${org.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {org.status?.charAt(0).toUpperCase() + org.status?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">Success Rate:</span>&nbsp;
                  <span>{parseFloat(org.successRate || 0).toFixed(2)}%</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">Rating:</span>&nbsp;
                  <span>{parseFloat(org.rating || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold">Created At:</span>&nbsp;
                  <span>{org.createdAt ? new Date(org.createdAt).toLocaleDateString() : ""}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-20" /> {/* Spacer for avatar overlay */}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "donations" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
          onClick={() => setTab("donations")}
        >
          Sao kê
        </button>
        {org.role !== "user" && (
          <button
            className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "campaigns" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
            onClick={() => setTab("campaigns")}
          >
            Chiến dịch
          </button>
        )}
      </div>

      {/* Tab content */}
      {tab === "donations" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-neutral-900">
              {org.role === "user" ? "Quyên góp của người dùng" : "Quyên góp cho tổ chức"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {donations && donations.length > 0 ? (
              <div className="space-y-4">
                {donations.slice(0, 10).map((donation: any) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          <Link 
                            href={`/campaigns/${donation.campaign?.id || donation.campaignId}`}
                            className="hover:text-primary transition-colors"
                          >
                            {donation.campaign?.title || donation.campaignTitle}
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
                <p className="text-neutral-600 mb-4">
                  {org.role === "user"
                    ? "Người dùng này chưa quyên góp cho chiến dịch nào."
                    : "Các chiến dịch của tổ chức này chưa nhận được quyên góp nào."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "campaigns" && org.role !== "user" && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch của tổ chức</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                    >
                      <Link href={`/campaigns/${campaign.id}`}>
                        <h4 className="font-medium text-sm text-neutral-900 hover:text-primary transition-colors">
                          {campaign.title}
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1">
                          {campaign.category?.name}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  Tổ chức này chưa tạo chiến dịch nào.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-900">
            {org.role === "user" ? "Tác động của người dùng" : "Tác động của tổ chức"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">${Math.round(totalDonated)}</div>
              <div className="text-sm text-neutral-600">
                {org.role === "user"
                  ? "Tổng số tiền đã quyên góp"
                  : "Tổng số tiền đã quyên góp cho các chiến dịch"}
              </div>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary">{campaignsSupported}</div>
              <div className="text-sm text-neutral-600">
                {org.role === "user"
                  ? "Chiến dịch đã ủng hộ"
                  : "Chiến dịch đã nhận quyên góp"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



// import { useRoute } from "wouter";
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Heart, DollarSign, TrendingUp, GraduationCap } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Link } from "wouter";

// export default function OrganizationDetail() {
//   const [match, params] = useRoute("/organizations/:id");
//   const id = params?.id;
//   const [org, setOrg] = useState<any>(null);
//   const [donatedList, setDonatedList] = useState<any[]>([]); // Tổ chức đi quyên góp
//   const [statementList, setStatementList] = useState<any[]>([]); // Tổ chức nhận quyên góp
//   const [campaigns, setCampaigns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState<"donations" | "statement" | "campaigns">("donations");

//   useEffect(() => {
//     if (!id) return;
//     async function fetchData() {
//       setLoading(true);
//       try {
//         // Lấy thông tin tổ chức
//         const orgRes = await fetch(`/api/organizations/${id}`);
//         const orgData = await orgRes.json();
//         setOrg(orgData);

//         // Lấy danh sách các khoản tổ chức này đã đi quyên góp (tổ chức là donor)
//         // API này cần backend hỗ trợ, ví dụ: /api/donations/user/:id hoặc /api/donations/organization/:id
//         const donatedRes = await fetch(`/api/donations/user/${id}`);
//         const donatedData = await donatedRes.json();
//         setDonatedList(donatedData);

//         // Lấy các campaign của tổ chức
//         const campRes = await fetch(`/api/campaigns`);
//         const allCampaigns = await campRes.json();
//         const orgCampaigns = allCampaigns.filter((c: any) => c.organizationId === Number(id));
//         setCampaigns(orgCampaigns);

//         // Lấy donations cho các campaign này (tổ chức là recipient)
//         let allReceived: any[] = [];
//         for (const campaign of orgCampaigns) {
//           const donRes = await fetch(`/api/donations/campaign/${campaign.id}`);
//           const dons = await donRes.json();
//           allReceived = allReceived.concat(
//             dons.map((d: any) => ({
//               ...d,
//               campaign: { title: campaign.title, id: campaign.id }
//             }))
//           );
//         }
//         setStatementList(allReceived);
//       } catch (error) {
//         setOrg(null);
//         setCampaigns([]);
//         setDonatedList([]);
//         setStatementList([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, [id]);

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   if (!org)
//     return (
//       <p className="text-center text-red-500 font-semibold mt-10">
//         Organization not found
//       </p>
//     );

//   // Tổng số tiền tổ chức đã đi quyên góp
//   const totalDonated = donatedList.reduce((sum, d) => sum + parseFloat(d.amount), 0);
//   // Số chiến dịch tổ chức đã ủng hộ
//   const campaignsSupported = new Set(donatedList.map((d) => d.campaignId)).size;

//   // Tổng số tiền tổ chức đã nhận được
//   const totalReceived = statementList.reduce((sum, d) => sum + parseFloat(d.amount), 0);
//   // Số chiến dịch đã nhận quyên góp
//   const campaignsWithDonation = new Set(statementList.map((d) => d.campaign?.id || d.campaignId)).size;

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
//                 <GraduationCap className="w-20 h-20 text-primary" />
//               </div>
//               <div>
//                 <h2 className="text-3xl font-bold text-neutral-900">{org.name}</h2>
//                 <div className="text-neutral-600">{org.description}</div>
//               </div>
//             </div>
//             {/* Thông tin tổ chức bên phải, cùng hàng */}
//             <div className="ml-12 grid grid-cols-2 gap-x-8 gap-y-1 text-sm min-w-[320px]">
//               <div className="flex items-center">
//                 <span className="font-semibold">Status:</span>&nbsp;
//                 <span className={`inline-block px-2 py-0.5 rounded ${org.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
//                   {org.status?.charAt(0).toUpperCase() + org.status?.slice(1)}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold">Success Rate:</span>&nbsp;
//                 <span>{parseFloat(org.successRate || 0).toFixed(2)}%</span>
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold">Rating:</span>&nbsp;
//                 <span>{parseFloat(org.rating || 0).toFixed(2)}</span>
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold">Created At:</span>&nbsp;
//                 <span>{org.createdAt ? new Date(org.createdAt).toLocaleDateString() : ""}</span>
//               </div>
//             </div>
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
//           className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "statement" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
//           onClick={() => setTab("statement")}
//         >
//           Sao kê
//         </button>
//         <button
//           className={`px-6 py-2 font-semibold text-sm transition-colors border-b-2 ${tab === "campaigns" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
//           onClick={() => setTab("campaigns")}
//         >
//           Chiến dịch
//         </button>
//       </div>

//       {/* Tab Quyên góp: Tổ chức đi quyên góp */}
//      {tab === "donations" && (
//   <Card className="mb-6">
//     <CardHeader>
//       <CardTitle className="text-xl font-semibold text-neutral-900">Quyên góp gần đây</CardTitle>
//     </CardHeader>
//     <CardContent>
//       {donatedList && donatedList.length > 0 ? (
//         <div className="space-y-4">
//           {donatedList.slice(0, 5).map((donation: any) => (
//             <div key={donation.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
//               <div className="flex items-center">
//                 <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
//                   <Heart className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-medium text-neutral-900">
//                     <Link 
//                       href={`/campaigns/${donation.campaignId}`}
//                       className="hover:text-primary transition-colors"
//                     >
//                       {donation.campaign?.title || donation.campaignTitle || `Chiến dịch #${donation.campaignId}`}
//                     </Link>
//                   </h3>
//                   <p className="text-sm text-neutral-600">
//                     Ngày quyên góp: {new Date(donation.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="font-semibold text-primary">
//                   ${Math.round(parseFloat(donation.amount))}
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   {donation.type}
//                 </Badge>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-8">
//           <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-neutral-900 mb-2">Chưa có quyên góp nào</h3>
//           <p className="text-neutral-600 mb-4">Tổ chức này chưa quyên góp cho chiến dịch nào.</p>
//         </div>
//       )}
//     </CardContent>
//     {/* Impact Summary */}
//     <div className="px-6 pb-6">
//       <div className="text-center p-4 bg-primary/5 rounded-lg mt-6">
//         <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
//         <div className="text-2xl font-bold text-primary">${Math.round(totalDonated)}</div>
//         <div className="text-sm text-neutral-600">Tổng số tiền đã quyên góp</div>
//       </div>
//       <div className="text-center p-4 bg-secondary/5 rounded-lg mt-4">
//         <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
//         <div className="text-2xl font-bold text-secondary">{campaignsSupported}</div>
//         <div className="text-sm text-neutral-600">Chiến dịch đã ủng hộ</div>
//       </div>
//     </div>
//   </Card>
// )}

//       {/* Tab Sao kê: Tổ chức nhận quyên góp */}
//       {tab === "statement" && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-xl font-semibold text-neutral-900">Sao kê nhận quyên góp</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {statementList && statementList.length > 0 ? (
//               <div className="space-y-4">
//                 {statementList.slice(0, 10).map((donation: any) => (
//                   <div key={donation.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
//                         <Heart className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium text-neutral-900">
//                           <Link 
//                             href={`/campaigns/${donation.campaign?.id || donation.campaignId}`}
//                             className="hover:text-primary transition-colors"
//                           >
//                             {donation.campaign?.title || donation.campaignTitle || `Chiến dịch #${donation.campaignId}`}
//                           </Link>
//                         </h3>
//                         <p className="text-sm text-neutral-600">
//                           Ngày nhận: {new Date(donation.createdAt).toLocaleDateString()}
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
//                 <h3 className="text-lg font-semibold text-neutral-900 mb-2">Chưa có khoản nhận nào</h3>
//                 <p className="text-neutral-600 mb-4">
//                   Các chiến dịch của tổ chức này chưa nhận được quyên góp nào.
//                 </p>
//               </div>
//             )}
//           </CardContent>
//           {/* Tổng kết */}
//           <div className="px-6 pb-6">
//             <div className="text-center p-4 bg-primary/5 rounded-lg mt-6">
//               <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
//               <div className="text-2xl font-bold text-primary">${Math.round(totalReceived)}</div>
//               <div className="text-sm text-neutral-600">Tổng số tiền tổ chức đã nhận được</div>
//             </div>
//             <div className="text-center p-4 bg-secondary/5 rounded-lg mt-4">
//               <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
//               <div className="text-2xl font-bold text-secondary">{campaignsWithDonation}</div>
//               <div className="text-sm text-neutral-600">Chiến dịch đã nhận quyên góp</div>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Tab Chiến dịch */}
//       {tab === "campaigns" && (
//         <div className="space-y-8">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold text-neutral-900">Chiến dịch của tổ chức</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {campaigns.length > 0 ? (
//                 <div className="space-y-3">
//                   {campaigns.map((campaign: any) => (
//                     <div
//                       key={campaign.id}
//                       className="p-3 border border-gray-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
//                     >
//                       <Link href={`/campaigns/${campaign.id}`}>
//                         <h4 className="font-medium text-sm text-neutral-900 hover:text-primary transition-colors">
//                           {campaign.title}
//                         </h4>
//                         <p className="text-xs text-neutral-600 mt-1">
//                           {campaign.category?.name}
//                         </p>
//                       </Link>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-neutral-500">
//                   Tổ chức này chưa tạo chiến dịch nào.
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }