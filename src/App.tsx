import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from '@capacitor/core';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import MobileBlock from "./pages/MobileBlock";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Check if running inside Capacitor native app or WebView
function isNativeApp(): boolean {
  // Check user agent for Android WebView or iOS WebView
  const userAgent = navigator.userAgent || '';
  const isAndroidWebView = /wv|Android.*Version\/[\d.]+.*Chrome\/[\d.]+ Mobile/.test(userAgent) && /Android/.test(userAgent);
  const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent);
  
  if (isAndroidWebView || isIOSWebView) {
    return true;
  }

  try {
    // Capacitor detection
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
      return true;
    }
    if ((window as any).Capacitor?.isNative) {
      return true;
    }
    return false;
  } catch {
    return !!(window as any).Capacitor?.isNative || 
           (window as any).Capacitor?.getPlatform?.() !== 'web';
  }
}

// Component to handle mobile blocking
function MobileGuard({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  // While detecting, show nothing to prevent flash
  if (isMobile === undefined) {
    return null;
  }
  
  // Allow native app to bypass mobile block
  if (isNativeApp()) {
    return <>{children}</>;
  }
  
  // On mobile browser, show block page
  if (isMobile) {
    return <MobileBlock />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MobileGuard>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/lancamentos" element={<Index />} />
              <Route path="/investimentos" element={<Index />} />
              <Route path="/dividas" element={<Index />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/cadastro" element={<Auth />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MobileGuard>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
