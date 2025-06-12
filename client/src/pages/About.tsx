// import { useQuery } from "@tanstack/react-query";
// import { Globe, Target, Star, Award, CheckCircle } from "lucide-react";

// export default function About() {
//   const { data: stats } = useQuery({
//     queryKey: ["/api/stats"],
//     queryFn: async () => {
//       const response = await fetch('/api/stats');
//       return response.json();
//     },
//   });

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-16 space-y-24 text-neutral-800">
      
//       {/* Giới thiệu */}
//       <section className="space-y-6 text-center">
//         <h1 className="text-5xl font-extrabold  leading-tight">
//           Chia Sẻ Yêu Thương<br />
//           Kết nối – Lan tỏa – Hành động
//         </h1>
//         <p className="text-lg max-w-3xl mx-auto text-gray-700">
//           Chúng tôi là một tổ chức phi lợi nhuận mang sứ mệnh kết nối những tấm lòng nhân ái
//           với các hoàn cảnh khó khăn trên khắp Việt Nam. Mọi chiến dịch đều được kiểm duyệt kỹ lưỡng,
//           công khai minh bạch và cập nhật tiến độ thường xuyên.
//         </p>
//       </section>

//       {/* Tầm nhìn - Sứ mệnh - Giá trị */}
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
//         <div className="space-y-3">
//           <Globe className="w-10 h-10 mx-auto text-primary" />
//           <h3 className="text-xl font-semibold">Tầm nhìn</h3>
//           <p>Trở thành nền tảng thiện nguyện tin cậy, lan tỏa giá trị yêu thương đến mọi miền đất nước.</p>
//         </div>
//         <div className="space-y-3">
//           <Target className="w-10 h-10 mx-auto text-green-600" />
//           <h3 className="text-xl font-semibold">Sứ mệnh</h3>
//           <p>Kết nối, hỗ trợ và minh bạch trong mọi hoạt động gây quỹ cộng đồng.</p>
//         </div>
//         <div className="space-y-3">
//           <Star className="w-10 h-10 mx-auto text-yellow-500" />
//           <h3 className="text-xl font-semibold">Giá trị cốt lõi</h3>
//           <ul className="list-disc list-inside text-left mx-auto max-w-xs text-sm text-gray-700">
//             <li>Minh bạch & Trung thực</li>
//             <li>Đồng cảm & Trách nhiệm</li>
//             <li>Kết nối cộng đồng</li>
//             <li>Đổi mới & Bền vững</li>
//           </ul>
//         </div>
//       </section>

//       {/* Thành tựu & Cam kết */}
//       <section className="grid grid-cols-1 md:grid-cols-2 gap-16 text-lg leading-relaxed">
//         <div>
//           <div className="flex items-center gap-3 mb-3">
//             <Award className="w-6 h-6 text-yellow-600" />
//             <h3 className="text-xl font-semibold">Thành tựu nổi bật</h3>
//           </div>
//           <p>
//             Hơn <span className="text-primary font-semibold">10 tỷ đồng</span> được quyên góp, 
//             hỗ trợ hơn <span className="text-primary font-semibold">25,000 người</span> trong các chiến dịch thiện nguyện trên toàn quốc.
//           </p>
//         </div>
//         <div>
//           <div className="flex items-center gap-3 mb-3">
//             <CheckCircle className="w-6 h-6 text-green-600" />
//             <h3 className="text-xl font-semibold">Cam kết minh bạch</h3>
//           </div>
//           <p>
//             Mỗi chiến dịch đều có báo cáo công khai, cập nhật chi tiết tiến độ, 
//             giúp nhà hảo tâm theo dõi rõ ràng từng đóng góp của mình.
//           </p>
//         </div>
//       </section>

//       {/* Thống kê nhanh */}
//       <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center bg-blue-50 py-10 rounded-xl">
//         {[
//           {
//             label: "Tổng quyên góp",
//             value: stats?.totalRaised
//               ? Math.round(parseFloat(stats.totalRaised)).toLocaleString("vi-VN") + "₫"
//               : "0₫",
//           },
//           { label: "Chiến dịch", value: stats?.activeCampaigns || 0 },
//           { label: "Tổ chức xác thực", value: stats?.verifiedOrgs || 0 },
//           { label: "Nhà hảo tâm", value: stats?.totalDonors || 0 },
//         ].map((item, index) => (
//           <div key={index}>
//             <div className="text-3xl font-bold text-primary">{item.value}</div>
//             <div className="text-sm text-gray-600 mt-1">{item.label}</div>
//           </div>
//         ))}
//       </section>
//     </div>
//   );
// }


import { useQuery } from "@tanstack/react-query";
import { Globe, Target, Star, Award, CheckCircle } from "lucide-react";

export default function About() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      return response.json();
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-20 text-neutral-800">
      {/* Giới thiệu */}
      <section className="space-y-6 text-center mb-12">
        <h1 className="text-5xl font-extrabold text-primary leading-tight mb-4">
          Chia Sẻ Yêu Thương<br />
          <span className="text-blue-700">Kết nối – Lan tỏa – Hành động</span>
        </h1>
        <p className="text-lg max-w-3xl mx-auto text-gray-700">
          Chúng tôi là một tổ chức phi lợi nhuận mang sứ mệnh kết nối những tấm lòng nhân ái
          với các hoàn cảnh khó khăn trên khắp Việt Nam. Mọi chiến dịch đều được kiểm duyệt kỹ lưỡng,
          công khai minh bạch và cập nhật tiến độ thường xuyên.
        </p>
      </section>

      {/* Tầm nhìn - Sứ mệnh - Giá trị */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-2xl bg-white shadow p-8 flex flex-col items-center text-center border border-blue-100">
          <Globe className="w-10 h-10 text-primary mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-blue-900">Tầm nhìn</h3>
          <p className="text-gray-700">
            Trở thành nền tảng thiện nguyện tin cậy, lan tỏa giá trị yêu thương đến mọi miền đất nước.
          </p>
        </div>
        <div className="rounded-2xl bg-white shadow p-8 flex flex-col items-center text-center border border-green-100">
          <Target className="w-10 h-10 text-green-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-green-900">Sứ mệnh</h3>
          <p className="text-gray-700">
            Kết nối, hỗ trợ và minh bạch trong mọi hoạt động gây quỹ cộng đồng.
          </p>
        </div>
        <div className="rounded-2xl bg-white shadow p-8 flex flex-col items-center text-center border border-yellow-100">
          <Star className="w-10 h-10 text-yellow-500 mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-yellow-700">Giá trị cốt lõi</h3>
          <ul className=" list-inside text-left mx-auto max-w-xs text-sm text-gray-700 space-y-1">
            <li>Minh bạch & Trung thực</li>
            <li>Đồng cảm & Trách nhiệm</li>
            <li>Kết nối cộng đồng</li>
            <li>Đổi mới & Bền vững</li>
          </ul>
        </div>
      </section>

      {/* Thành tựu & Cam kết */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-white shadow p-8 border border-yellow-100">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-7 h-7 text-yellow-600" />
            <h3 className="text-xl font-semibold text-yellow-700">Thành tựu nổi bật</h3>
          </div>
          <p className="text-gray-700 text-lg">
            Hơn <span className="text-primary font-semibold">{stats?.totalRaised ? Math.round(parseFloat(stats.totalRaised)).toLocaleString("vi-VN") : "0"}₫</span> được quyên góp, 
            hỗ trợ hơn <span className="text-primary font-semibold">{stats?.activeCampaigns || 0}</span> trong các chiến dịch thiện nguyện trên toàn quốc.
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-white shadow p-8 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
            <h3 className="text-xl font-semibold text-green-700">Cam kết minh bạch</h3>
          </div>
          <p className="text-gray-700 text-lg">
            Mỗi chiến dịch đều có báo cáo công khai, cập nhật chi tiết tiến độ, 
            giúp nhà hảo tâm theo dõi rõ ràng từng đóng góp của mình.
          </p>
        </div>
      </section>

      {/* Thống kê nhanh */}
      <section className="py-10 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg">
        <div className="max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-primary mb-2 drop-shadow">
                {stats?.totalRaised ? Math.round(parseFloat(stats.totalRaised)).toLocaleString("vi-VN") : "0"}₫
              </span>
              <span className="text-neutral-700 font-medium">Tổng quyên góp</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-primary mb-2 drop-shadow">
                {stats?.activeCampaigns || 0}
              </span>
              <span className="text-neutral-700 font-medium">Chiến dịch</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-primary mb-2 drop-shadow">
                {stats?.verifiedOrgs || 0}
              </span>
              <span className="text-neutral-700 font-medium">Tổ chức xác thực</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-primary mb-2 drop-shadow">
                {stats?.totalDonors || 0}
              </span>
              <span className="text-neutral-700 font-medium">Nhà hảo tâm</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}