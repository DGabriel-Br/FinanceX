import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { NativeRedirect } from "@/components/routing/NativeRedirect";

// Lazy load pages for better initial bundle size
const FinanceLayout = lazy(() => import("./pages/finance/FinanceLayout"));
const DashboardPage = lazy(() => import("./pages/finance/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/finance/TransactionsPage"));
const InvestmentsPage = lazy(() => import("./pages/finance/InvestmentsPage"));
const DebtsPage = lazy(() => import("./pages/finance/DebtsPage"));

// Landing - lazy loaded for performance
const Landing = lazy(() => import("./pages/Landing"));

// Auth pages - loaded eagerly since they're entry points
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antigo cacheTime)
    },
  },
});

// Loading fallback component - usa fundo escuro para evitar flash branco
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-sidebar">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
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
              {/* Public landing page - only on web, native redirects to login/welcome */}
              <Route path="/" element={<NativeRedirect webElement={<Landing />} nativeRedirectTo="/login" />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />
              
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
