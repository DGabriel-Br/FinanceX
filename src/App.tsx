import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/lancamentos" element={<Index />} />
            <Route path="/investimentos" element={<Index />} />
            <Route path="/dividas" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/cadastro" element={<Auth />} />
            <Route path="/esqueci-senha" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/settings" element={<Settings />} />
            {/* Admin Routes - wrapped with AdminPeriodProvider */}
            <Route path="/admin" element={<AdminPeriodProvider><AdminOverview /></AdminPeriodProvider>} />
            <Route path="/admin/usuarios" element={<AdminPeriodProvider><AdminUsers /></AdminPeriodProvider>} />
            <Route path="/admin/atividade" element={<AdminPeriodProvider><AdminActivity /></AdminPeriodProvider>} />
            <Route path="/admin/seguranca" element={<AdminPeriodProvider><AdminSecurity /></AdminPeriodProvider>} />
            <Route path="/admin/sistema" element={<AdminPeriodProvider><AdminSystem /></AdminPeriodProvider>} />
            <Route path="/admin/roles" element={<AdminPeriodProvider><AdminRoles /></AdminPeriodProvider>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
