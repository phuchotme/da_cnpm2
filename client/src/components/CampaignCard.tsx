import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Heart } from "lucide-react";

interface CampaignCardProps {
  campaign: {
    id: number;
    title: string;
    description: string;
    target: string;
    raised: string;
    deadline: string;
    imageUrl?: string;
    category: {
      name: string;
    };
    organization: {
      name: string;
    };
  };
}

// export default function CampaignCard({ campaign }: CampaignCardProps) {
//   const progressPercentage = Math.round((parseFloat(campaign.raised) / parseFloat(campaign.target)) * 100);
//   const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

//   return (
//     <Card className="campaign-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
//       <img
//         src={campaign.imageUrl || "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"}
//         alt={campaign.title}
//         className="w-full h-48 object-cover"
//       />
//       <CardContent className="p-6">
//         <div className="flex items-center justify-between mb-3">
//           <Badge variant="secondary" className="bg-accent/10 text-accent">
//             {campaign.category.name}
//           </Badge>
//           <div className="flex items-center text-secondary">
//             <CheckCircle className="w-4 h-4 mr-1" />
//             <span className="text-sm font-medium">Verified</span>
//           </div>
//         </div>
        
//         <h3 className="text-xl font-semibold text-neutral-900 mb-2">{campaign.title}</h3>
//         <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
//           {campaign.description}
//         </p>
        
//         <div className="mb-4">
//           <div className="flex justify-between text-sm mb-2">
//             <span className="text-neutral-600">Progress</span>
//             <span className="font-medium">
//               ${Math.round(parseFloat(campaign.raised)).toLocaleString()} of ${Math.round(parseFloat(campaign.target)).toLocaleString()}
//             </span>
//           </div>
//           <Progress value={progressPercentage} className="h-2 mb-2 progress-bar" />
//           <div className="text-sm text-neutral-600">
//             {progressPercentage}% funded
//           </div>
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="text-sm text-neutral-600 flex items-center">
//             <Clock className="w-4 h-4 mr-1" />
//             <span>{Math.max(0, daysLeft)} days left</span>
//           </div>
//           <Button asChild className="bg-primary text-white hover:bg-blue-700">
//             <Link href={`/campaigns/${campaign.id}`}>
//               <Heart className="w-4 h-4 mr-2" />
//               Donate Now
//             </Link>
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// ...existing code...
export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage = Math.round((parseFloat(campaign.raised) / parseFloat(campaign.target)) * 100);
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Format tiền VNĐ
  const formatVND = (amount: number) =>
    amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

  return (
    <Card className="campaign-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <img
        src={campaign.imageUrl || "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"}
        alt={campaign.title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            {campaign.category.name}
          </Badge>
          <div className="flex items-center text-secondary">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Đã xác minh</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">{campaign.title}</h3>
        <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
          {campaign.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600">Tiến độ</span>
            <span className="font-medium">
              {formatVND(Math.round(parseFloat(campaign.raised)))} / {formatVND(Math.round(parseFloat(campaign.target)))}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2 progress-bar" />
          <div className="text-sm text-neutral-600">
            {progressPercentage}% đã gây quỹ
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{Math.max(0, daysLeft)} ngày còn lại</span>
          </div>
          <Button asChild className="bg-primary text-white hover:bg-blue-700">
            <Link href={`/campaigns/${campaign.id}`}>
              <Heart className="w-4 h-4 mr-2" />
              Quyên góp ngay
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
// ...existing code...