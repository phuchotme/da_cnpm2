import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, GraduationCap, Heart, Leaf, Clock, Star } from "lucide-react";
import CampaignCard from "@/components/CampaignCard";

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      return response.json();
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      return response.json();
    },
  });

  const { data: organizations } = useQuery({
    queryKey: ["/api/organizations"],
    queryFn: async () => {
      const response = await fetch('/api/organizations');
      return response.json();
    },
  });

  const featuredCampaigns = campaigns?.slice(0, 3) || [];
  const featuredOrganizations = organizations?.slice(0, 3) || [];

  return (
    <div>
      {/* Hero Section with big background image */}
      <section
        className="relative w-full h-[480px] md:h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: `url('https://khoinguonsangtao.vn/wp-content/uploads/2023/02/hinh-anh-tre-em.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 drop-shadow-lg">
              Quyên góp minh bạch.<br />
              <span className="text-blue-200">Chung tay gieo mầm hạnh phúc.</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed drop-shadow">
              Kết nối với các tổ chức uy tín và theo dõi từng đóng góp của bạn tạo nên thay đổi tích cực cho cộng đồng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-50">
                <Link href="/campaigns">Xem các chiến dịch</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/apply-organization" className="text-white hover:text-primary">
                  Đăng ký tổ chức gây quỹ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalRaised ? Math.round(parseFloat(stats.totalRaised)).toLocaleString('vi-VN') : '0'}₫
              </div>
              <div className="text-neutral-600">Tổng số tiền đã quyên góp</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats?.activeCampaigns || 0}</div>
              <div className="text-neutral-600">Chiến dịch đang hoạt động</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats?.verifiedOrgs || 0}</div>
              <div className="text-neutral-600">Tổ chức đã xác thực</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats?.totalDonors || 0}</div>
              <div className="text-neutral-600">Nhà hảo tâm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Chiến dịch nổi bật</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Khám phá các chiến dịch đã xác thực và đang tạo nên thay đổi tích cực. Mỗi khoản quyên góp đều được theo dõi và báo cáo minh bạch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign: any) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {campaigns && campaigns.length > 3 && (
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/campaigns">Xem tất cả chiến dịch</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Organization Spotlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Tổ chức uy tín</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Tất cả tổ chức đều được kiểm duyệt kỹ lưỡng. Theo dõi tỷ lệ thành công và mức độ minh bạch của họ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOrganizations.map((org: any) => (
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
                        <span>Đã xác thực</span>
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
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-600">Đánh giá</div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/organizations/${org.id}`}>Xem hồ sơ</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}