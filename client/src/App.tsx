import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Campaigns from "@/pages/Campaigns";
import CampaignDetail from "@/pages/CampaignDetail";
import UserDashboard from "@/pages/UserDashboard";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ApplyOrganization from "@/pages/ApplyOrganization";
import CreateCampaign from "@/pages/CreateCampaign";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/campaigns/:id" component={CampaignDetail} />
        
        {/* Protected Routes */}
        <Route path="/dashboard">
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/my-donations">
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/apply-organization">
          <ProtectedRoute requiredRole={['user']}>
            <ApplyOrganization />
          </ProtectedRoute>
        </Route>
        
        <Route path="/org-dashboard">
          <ProtectedRoute requiredRole={['organization']}>
            <OrganizationDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/create-campaign">
          <ProtectedRoute requiredRole={['organization']}>
            <CreateCampaign />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin">
          <ProtectedRoute requiredRole={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
