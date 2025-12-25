import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import logo from '@/assets/logo.png';

export default function Welcome() {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirecionar para login no desktop
  useEffect(() => {
    if (!loading && isMobile === false) {
      navigate('/login', { replace: true });
    }
  }, [isMobile, loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="FinanceX" className="w-16 h-16 rounded-2xl animate-pulse object-cover" />
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-sidebar relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating blurred circles */}
        <div 
          className={cn(
            "absolute top-[15%] left-[10%] w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-primary/30 to-income/20 rounded-full blur-3xl transition-all duration-1000",
            mounted ? "opacity-60 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute top-[20%] right-[15%] w-24 h-24 md:w-36 md:h-36 bg-gradient-to-br from-income/25 to-primary/15 rounded-full blur-2xl transition-all duration-1000 delay-200",
            mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute bottom-[25%] right-[20%] w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-primary/20 to-income/25 rounded-full blur-2xl transition-all duration-1000 delay-500",
            mounted ? "opacity-40 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute bottom-[15%] left-[5%] w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-income/20 to-primary/30 rounded-full blur-3xl transition-all duration-1000 delay-300",
            mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
          )} 
        />
        
        {/* Subtle star-like dots */}
        <div className="absolute top-[30%] left-[30%] w-1 h-1 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-[25%] left-[60%] w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-300" />
        <div className="absolute top-[50%] left-[80%] w-1 h-1 bg-white/25 rounded-full animate-pulse delay-500" />
        <div className="absolute top-[60%] left-[15%] w-1 h-1 bg-white/20 rounded-full animate-pulse delay-700" />
        <div className="absolute top-[40%] left-[45%] w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse delay-200" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo */}
        <div 
          className={cn(
            "mb-8 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <img 
            src={logo} 
            alt="FinanceX" 
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-2xl shadow-primary/30 object-cover" 
          />
        </div>

        {/* Title */}
        <h1 
          className={cn(
            "text-3xl md:text-4xl font-bold text-white text-center mb-4 transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Bem-vindo(a) ao{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-income">
            FinanceX
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className={cn(
            "text-white/70 text-center text-base md:text-lg max-w-sm mb-12 transition-all duration-700 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Organize suas finanças de forma simples e eficiente. Comece agora!
        </p>
      </div>

      {/* Bottom Buttons */}
      <div 
        className={cn(
          "px-6 pb-8 pt-4 space-y-3 relative z-10 transition-all duration-700 delay-400",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <Button
          onClick={() => navigate('/cadastro')}
          variant="outline"
          className="w-full h-14 text-base font-semibold rounded-full bg-white text-sidebar border-0 hover:bg-white/90 hover:text-sidebar transition-all duration-300 shadow-lg"
        >
          Registre-se
        </Button>
        
        <Button
          onClick={() => navigate('/login')}
          className="w-full h-14 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/30"
        >
          Entrar
        </Button>
      </div>

      {/* Safe area bottom spacing for mobile */}
      <div className="safe-area-bottom" />
    </div>
  );
}
