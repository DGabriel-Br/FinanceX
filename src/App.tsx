import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminPeriodProvider } from "@/contexts/AdminPeriodContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminRoles from "./pages/admin/AdminRoles";

const queryClient = new QueryClient();

// Layout component that provides AdminPeriodContext to all admin routes
const AdminPeriodLayout = () => (
  <AdminPeriodProvider>
    <Outlet />
  </AdminPeriodProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/lancamentos" element={<Index />} />
            <Route path="/investimentos" element={<Index />} />
            <Route path="/dividas" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/cadastro" element={<Auth />} />
            <Route path="/esqueci-senha" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/settings" element={<Settings />} />
            {/* Admin Routes - wrapped with AdminPeriodProvider via layout */}
            <Route element={<AdminPeriodLayout />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
              <Route path="/admin/atividade" element={<AdminActivity />} />
              <Route path="/admin/seguranca" element={<AdminSecurity />} />
              <Route path="/admin/sistema" element={<AdminSystem />} />
              <Route path="/admin/roles" element={<AdminRoles />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
