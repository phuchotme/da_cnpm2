// import { Link } from "wouter";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Star, FileText, CheckCircle } from "lucide-react";

// interface OrganizationCardProps {
//   organization: {
//     id: number;
//     name: string;
//     description: string;
//     status: "pending" | "approved" | "rejected";
//     documents?: string[];
//     successRate: string;
//     rating: string;
//     createdAt: string;
//   };
// }

// export default function OrganizationCard({ organization }: OrganizationCardProps) {
//   const statusColor =
//     organization.status === "approved"
//       ? "text-green-600"
//       : organization.status === "pending"
//       ? "text-yellow-500"
//       : "text-red-500";

//   return (
//     <Card className="organization-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
//       <CardContent className="p-6">
//         <div className="flex items-center justify-between mb-3">
//           <Badge variant="secondary" className={`${statusColor} bg-accent/10`}>
//             {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
//           </Badge>
//           <div className="flex items-center text-secondary">
//             <CheckCircle className="w-4 h-4 mr-1" />
//             <span className="text-sm font-medium">Verified</span>
//           </div>
//         </div>

//         <h3 className="text-xl font-semibold text-neutral-900 mb-2">{organization.name}</h3>
//         <p className="text-neutral-600 text-sm mb-4 line-clamp-3">{organization.description}</p>

//         <div className="mb-4">
//           <div className="flex justify-between text-sm mb-2">
//             <span className="text-neutral-600">Success Rate</span>
//             <span className="font-medium">{organization.successRate}%</span>
//           </div>
//           <div className="flex justify-between text-sm mb-2">
//             <span className="text-neutral-600">Rating</span>
//             <span className="flex items-center font-medium">
//               <Star className="w-4 h-4 text-yellow-500 mr-1" />
//               {organization.rating}
//             </span>
//           </div>
//           {organization.documents && organization.documents.length > 0 && (
//             <div className="text-sm text-neutral-600 flex items-center mt-2">
//               <FileText className="w-4 h-4 mr-1" />
//               <span>{organization.documents.length} document(s) submitted</span>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="text-sm text-neutral-500">
//             Created on: {new Date(organization.createdAt).toLocaleDateString()}
//           </div>
//           <Button asChild className="bg-primary text-white hover:bg-blue-700">
//             <Link href={`/organizations/${organization.id}`}>
//               View More
//             </Link>
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
