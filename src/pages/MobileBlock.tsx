import { useState, useEffect } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

export default function MobileBlock() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadApp = () => {
    // TODO: Replace with actual app store links
    // For now, show a message
    window.open('https://play.google.com/store', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-sidebar relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className={cn(
            "absolute top-[15%] left-[10%] w-32 h-32 bg-gradient-to-br from-primary/30 to-income/20 rounded-full blur-3xl transition-all duration-1000",
            mounted ? "opacity-60 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute top-[20%] right-[15%] w-24 h-24 bg-gradient-to-br from-income/25 to-primary/15 rounded-full blur-2xl transition-all duration-1000 delay-200",
            mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute bottom-[25%] right-[20%] w-20 h-20 bg-gradient-to-br from-primary/20 to-income/25 rounded-full blur-2xl transition-all duration-1000 delay-500",
            mounted ? "opacity-40 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute bottom-[15%] left-[5%] w-28 h-28 bg-gradient-to-br from-income/20 to-primary/30 rounded-full blur-3xl transition-all duration-1000 delay-300",
            mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
          )} 
        />
        
        {/* Subtle star-like dots */}
        <div className="absolute top-[30%] left-[30%] w-1 h-1 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-[25%] left-[60%] w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-300" />
        <div className="absolute top-[50%] left-[80%] w-1 h-1 bg-white/25 rounded-full animate-pulse delay-500" />
        <div className="absolute top-[60%] left-[15%] w-1 h-1 bg-white/20 rounded-full animate-pulse delay-700" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo */}
        <div 
          className={cn(
            "mb-6 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <img 
            src={logo} 
            alt="FinanceX" 
            className="w-20 h-20 rounded-2xl shadow-2xl shadow-primary/30 object-cover" 
          />
        </div>

        {/* Icon */}
        <div 
          className={cn(
            "mb-6 p-4 rounded-full bg-primary/20 transition-all duration-700 delay-100",
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
        >
          <Smartphone className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h1 
          className={cn(
            "text-2xl font-bold text-white text-center mb-3 transition-all duration-700 delay-150",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Acesse pelo aplicativo
        </h1>

        {/* Description */}
        <p 
          className={cn(
            "text-white/70 text-center text-base max-w-xs mb-8 leading-relaxed transition-all duration-700 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Para a melhor experiência em dispositivos móveis, baixe nosso aplicativo oficial. 
          É mais rápido, seguro e otimizado para você.
        </p>

        {/* Features */}
        <div 
          className={cn(
            "w-full max-w-xs space-y-3 mb-8 transition-all duration-700 delay-250",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-2 h-2 rounded-full bg-income" />
            <span className="text-sm">Experiência otimizada para celular</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-2 h-2 rounded-full bg-income" />
            <span className="text-sm">Notificações em tempo real</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-2 h-2 rounded-full bg-income" />
            <span className="text-sm">Acesso offline aos seus dados</span>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div 
        className={cn(
          "px-6 pb-8 pt-4 relative z-10 transition-all duration-700 delay-300",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <Button
          onClick={handleDownloadApp}
          className="w-full h-14 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Baixar aplicativo
        </Button>
        
        <p className="text-white/40 text-xs text-center mt-4">
          A versão web está disponível apenas para computadores
        </p>
      </div>

      {/* Safe area bottom spacing for mobile */}
      <div className="safe-area-bottom" />
    </div>
  );
}
