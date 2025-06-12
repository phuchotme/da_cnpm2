// import { useAuth } from "@/hooks/useAuth";
// import { useLocation } from "wouter";
// import { useEffect } from "react";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredRole?: string[];
// }

// export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
//   const { isAuthenticated, isLoading, user } = useAuth();
//   const [, setLocation] = useLocation();

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       setLocation('/login');
//       return;
//     }

//     if (requiredRole && user && !requiredRole.includes(user.role)) {
//       setLocation('/');
//       return;
//     }
//   }, [isAuthenticated, isLoading, user, requiredRole, setLocation]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   if (requiredRole && user && !requiredRole.includes(user.role)) {
//     return null;
//   }

//   return <>{children}</>;
// }


import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (requiredRole && user && !requiredRole.includes(user.role)) {
      setLocation('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <span className="ml-4 text-lg text-primary">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-red-500">Bạn cần đăng nhập để truy cập trang này.</span>
      </div>
    );
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-red-500">Bạn không có quyền truy cập trang này.</span>
      </div>
    );
  }

  return <>{children}</>;
}