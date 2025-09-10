import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import Airlines from "./pages/Airlines";
import Logbook from "./pages/Logbook";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Admin from "./pages/Admin";
import UserManagement from "./pages/UserManagement";
import ManageAirlines from "./pages/ManageAirlines";
import RouteDashboard from "./pages/RouteDashboard";
import RouteBuilder from "./pages/Route";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/airlines" element={<Airlines />} />
            <Route path="/logbook" element={<Logbook />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/airlines" element={<ManageAirlines />} />
            <Route path="/admin/routes" element={<RouteDashboard />} />
            <Route path="/route" element={<RouteBuilder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
