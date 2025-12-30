import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminPeriodProvider } from "@/contexts/AdminPeriodContext";
import { Loader2 } from "lucide-react";

// Lazy load pages for better initial bundle size
const FinanceLayout = lazy(() => import("./pages/finance/FinanceLayout"));
const DashboardPage = lazy(() => import("./pages/finance/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/finance/TransactionsPage"));
const InvestmentsPage = lazy(() => import("./pages/finance/InvestmentsPage"));
const DebtsPage = lazy(() => import("./pages/finance/DebtsPage"));

// Landing and Plans - lazy loaded for performance
const Landing = lazy(() => import("./pages/Landing"));
const Plans = lazy(() => import("./pages/Plans"));

// Auth pages - loaded eagerly since they're entry points
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Admin pages - lazy loaded
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminSystem = lazy(() => import("./pages/admin/AdminSystem"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antigo cacheTime)
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Layout component that provides AdminPeriodContext to all admin routes
const AdminPeriodLayout = () => (
  <AdminPeriodProvider>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </AdminPeriodProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public landing page */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              
              {/* Plans page */}
              <Route path="/planos" element={<Plans />} />
              
              {/* Finance routes - using shared layout */}
              <Route element={<FinanceLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/lancamentos" element={<TransactionsPage />} />
                <Route path="/investimentos" element={<InvestmentsPage />} />
                <Route path="/dividas" element={<DebtsPage />} />
              </Route>
              
              {/* Auth routes - not lazy loaded */}
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
