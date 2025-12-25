import { useState, useEffect } from 'react';
import { Smartphone, Download, Zap, Bell, WifiOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MobileBlock() {
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownloadApp = () => {
    setIsDownloading(true);
    
    // Simulate download animation
    setTimeout(() => {
      window.open('https://play.google.com/store', '_blank');
      setTimeout(() => setIsDownloading(false), 500);
    }, 1500);
  };

  const features = [
    { icon: Zap, text: 'Experiência otimizada para celular', delay: 'delay-[400ms]' },
    { icon: Bell, text: 'Notificações em tempo real', delay: 'delay-[500ms]' },
    { icon: WifiOff, text: 'Funciona offline com sincronização', delay: 'delay-[600ms]' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sidebar via-sidebar to-[#0a1628] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main gradient orbs */}
        <div 
          className={cn(
            "absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl transition-all duration-1500",
            mounted ? "opacity-70 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute top-1/4 -right-16 w-64 h-64 bg-gradient-to-bl from-income/30 via-primary/15 to-transparent rounded-full blur-3xl transition-all duration-1500 delay-300",
            mounted ? "opacity-60 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute bottom-1/4 -left-10 w-48 h-48 bg-gradient-to-tr from-income/25 via-primary/20 to-transparent rounded-full blur-2xl transition-all duration-1500 delay-500",
            mounted ? "opacity-50 scale-100" : "opacity-0 scale-50"
          )} 
        />
        <div 
          className={cn(
            "absolute -bottom-10 right-0 w-56 h-56 bg-gradient-to-tl from-primary/35 via-income/15 to-transparent rounded-full blur-3xl transition-all duration-1500 delay-700",
            mounted ? "opacity-60 scale-100" : "opacity-0 scale-50"
          )} 
        />
        
        {/* Star-like animated dots */}
        <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-[15%] left-[70%] w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse delay-200" />
        <div className="absolute top-[40%] left-[85%] w-1 h-1 bg-white/30 rounded-full animate-pulse delay-400" />
        <div className="absolute top-[55%] left-[10%] w-1 h-1 bg-income/50 rounded-full animate-pulse delay-600" />
        <div className="absolute top-[70%] left-[90%] w-1 h-1 bg-white/25 rounded-full animate-pulse delay-800" />
        <div className="absolute top-[35%] left-[50%] w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse delay-300" />
        <div className="absolute top-[80%] left-[30%] w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-500" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">

        {/* Icon with animated ring */}
        <div 
          className={cn(
            "mb-6 relative transition-all duration-700 delay-100",
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
        >
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-150 animate-pulse" />
          <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 backdrop-blur-sm">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Title with gradient text */}
        <h1 
          className={cn(
            "text-2xl font-bold text-center mb-3 transition-all duration-700 delay-150 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Acesse pelo aplicativo
        </h1>

        {/* Description */}
        <p 
          className={cn(
            "text-white/60 text-center text-sm max-w-[280px] mb-8 leading-relaxed transition-all duration-700 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Para a melhor experiência em dispositivos móveis, baixe nosso aplicativo oficial. 
          É mais rápido, seguro e otimizado para você.
        </p>

        {/* Features with icons */}
        <div 
          className={cn(
            "w-full max-w-xs space-y-4 transition-all duration-700 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-500",
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                feature.delay
              )}
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-income/30 to-income/10">
                <feature.icon className="w-5 h-5 text-income" />
              </div>
              <span className="text-sm text-white/80 font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Button Section */}
      <div 
        className={cn(
          "px-6 pb-8 pt-6 relative z-10 transition-all duration-700 delay-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Decorative top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Enhanced Download Button */}
        <div className="relative group">
          {/* Glow effect behind button */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/80 to-income/60 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-500 group-hover:blur-xl" />
          
          {/* Button container with shine effect */}
          <Button
            onClick={handleDownloadApp}
            disabled={isDownloading}
            className="relative w-full h-16 text-base font-bold rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 text-primary-foreground transition-all duration-300 shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 disabled:opacity-100 overflow-hidden border border-white/10"
          >
            {/* Shine overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            
            {/* Inner highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            {isDownloading ? (
              <>
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <Download className="w-4 h-4 animate-pulse" />
                </div>
                <span className="animate-pulse tracking-wide">Baixando...</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <Download className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                </div>
                <span className="tracking-wide">Baixar aplicativo</span>
              </>
            )}
          </Button>
        </div>
        
        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <Shield className="w-3.5 h-3.5 text-income" />
          <p className="text-white/50 text-xs">
            Download seguro e verificado
          </p>
        </div>
        
        <p className="text-white/30 text-[11px] text-center mt-3">
          A versão web está disponível apenas para computadores
        </p>
      </div>

      {/* Safe area bottom spacing for mobile */}
      <div className="safe-area-bottom" />
    </div>
  );
}
