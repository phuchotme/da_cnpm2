// import { useQuery } from "@tanstack/react-query";
// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Star, GraduationCap, CheckCircle, Search } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { useLocation } from "wouter";

// export default function Organizations() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [, navigate] = useLocation();

//   const { data: organizations, isLoading } = useQuery({
//     queryKey: ["/api/organizations"],
//     queryFn: async () => {
//       const res = await fetch("/api/organizations");
//       return res.json();
//     },
//   });

//   const filteredOrganizations = organizations?.filter((org: any) =>
//     org.name.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];
// if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }
//   return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//            <div className="mb-8">
//          <h1 className="text-3xl font-bold text-neutral-900 mb-4">All Organizations</h1>
//          <p className="text-neutral-600 mb-6">
//            Browse through organizations that support amazing campaigns.
//         </p>
//         </div>
        

//         {/* Search Box */}
//        <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <Input
//               placeholder="Search campaigns..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </div>

        

//         {/* Content */}
//         {filteredOrganizations.length === 0 ? (
//           <div className="text-center py-12">
//             <h3 className="text-lg font-semibold text-neutral-900 mb-2">No organizations found</h3>
//             <p className="text-neutral-600">Try adjusting your search terms.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredOrganizations.map((org: any) => (
//               <Card key={org.id} className="bg-neutral-50 border-gray-200 hover:shadow-lg transition-shadow">
//                 <CardContent className="p-6">
//                   <div className="flex items-center mb-4">
//                     <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
//                       <GraduationCap className="w-6 h-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-neutral-900">{org.name}</h3>
//                       <div className="flex items-center text-secondary text-sm">
//                         <CheckCircle className="w-4 h-4 mr-1" />
//                         <span>Verified Organization</span>
//                       </div>
//                     </div>
//                   </div>

//                   <p className="text-neutral-600 text-sm mb-4">{org.description}</p>

//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div className="text-center">
//                       <div className="text-lg font-bold text-primary">{org.successRate || 0}%</div>
//                       <div className="text-xs text-neutral-600">Success Rate</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="flex items-center justify-center">
//                         <span className="text-lg font-bold text-primary mr-1">{org.rating || 0}</span>
//                         <div className="flex text-yellow-400">
//                           {[...Array(5)].map((_, i) => (
//                             <Star
//                               key={i}
//                               className={`w-3 h-3 ${
//                                 i < Math.round(org.rating || 0) ? "fill-current" : "text-gray-300"
//                               }`}
//                             />
//                           ))}
//                         </div>
//                       </div>
//                       <div className="text-xs text-neutral-600">Rating</div>
//                     </div>
//                   </div>

//                   <Button variant="outline" className="w-full" onClick={() => navigate(`/organizations/${org.id}`)}>
//                     View Profile
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
      
   
//   );
// }


import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, GraduationCap, CheckCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Organizations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["/api/organizations"],
    queryFn: async () => {
      const res = await fetch("/api/organizations");
      return res.json();
    },
  });

  const filteredOrganizations = organizations?.filter((org: any) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Tất cả tổ chức</h1>
        <p className="text-neutral-600 mb-6">
          Duyệt qua các tổ chức đang hỗ trợ những chiến dịch tuyệt vời.
        </p>
      </div>

      {/* Ô tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm tổ chức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Nội dung */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Không tìm thấy tổ chức nào</h3>
          <p className="text-neutral-600">Hãy thử thay đổi từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrganizations.map((org: any) => (
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
                      <span>Đã xác minh</span>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-600 text-sm mb-4">{org.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{org.successRate || 0}%</div>
                    <div className="text-xs text-neutral-600">Tỷ lệ thành công</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-bold text-primary mr-1">{org.rating || 0}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.round(org.rating || 0) ? "fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-600">Đánh giá</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => navigate(`/organizations/${org.id}`)}>
                  Xem hồ sơ
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}