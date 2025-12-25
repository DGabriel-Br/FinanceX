import { useState, useEffect, useMemo } from 'react';
import { Smartphone, Zap, Bell, WifiOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Floating particle component
const FloatingParticle = ({ 
  delay, 
  duration, 
  size, 
  startX, 
  startY,
  color 
}: { 
  delay: number; 
  duration: number; 
  size: number; 
  startX: number; 
  startY: number;
  color: string;
}) => {
  return (
    <div
      className={cn(
        "absolute rounded-full pointer-events-none",
        color
      )}
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        top: `${startY}%`,
        animation: `float-particle ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
};

export default function MobileBlock() {
  const [mounted, setMounted] = useState(false);
  const [clickedFeature, setClickedFeature] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFeatureClick = (index: number) => {
    setClickedFeature(index);
    setTimeout(() => setClickedFeature(null), 600);
  };

  // Generate random particles
  const particles = useMemo(() => {
    const colors = [
      'bg-primary/40',
      'bg-income/30',
      'bg-white/20',
      'bg-primary/25',
      'bg-income/20',
      'bg-white/15',
    ];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
      size: 2 + Math.random() * 6,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);


  const features = [
    { icon: Zap, text: 'Experiência otimizada para celular', delay: 'delay-[400ms]' },
    { icon: Bell, text: 'Notificações em tempo real', delay: 'delay-[500ms]' },
    { icon: WifiOff, text: 'Funciona offline com sincronização', delay: 'delay-[600ms]' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sidebar via-sidebar to-[#0a1628] relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} {...particle} />
        ))}
      </div>

      {/* CSS Animation for particles */}
      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(-100px) translateX(20px) scale(1.2);
            opacity: 0.8;
          }
          90% {
            opacity: 1;
          }
        }
      `}</style>

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
        <div 
          className={cn(
            "text-center mb-4 transition-all duration-700 delay-150",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h1 className="text-2xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
              Leve a experiência
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-income to-primary bg-clip-text text-transparent animate-pulse">
              completa
            </span>
            <span className="bg-gradient-to-r from-white/90 via-white to-white/80 bg-clip-text text-transparent">
              {" "}para o aplicativo
            </span>
          </h1>
          <div className="mt-2 h-0.5 w-16 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
        </div>

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
              onClick={() => handleFeatureClick(index)}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-300 cursor-pointer relative overflow-hidden select-none",
                "hover:bg-white/10 hover:border-income/20 hover:scale-[1.02] active:scale-[0.98]",
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
                feature.delay,
                clickedFeature === index && "border-income/40 bg-income/10"
              )}
            >
              {/* Ripple effect */}
              {clickedFeature === index && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 animate-ping bg-income/20 rounded-xl" style={{ animationDuration: '0.6s', animationIterationCount: 1 }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-income/40 rounded-full animate-ping" style={{ animationDuration: '0.5s' }} />
                </div>
              )}
              
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br from-income/30 to-income/10 transition-all duration-300",
                clickedFeature === index && "scale-110 from-income/50 to-income/20"
              )}>
                <feature.icon className={cn(
                  "w-5 h-5 text-income transition-all duration-300",
                  clickedFeature === index && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-sm text-white/80 font-medium transition-all duration-300",
                clickedFeature === index && "text-white"
              )}>{feature.text}</span>
              
              {/* Glow effect on click */}
              {clickedFeature === index && (
                <div className="absolute -inset-1 bg-gradient-to-r from-income/30 via-income/20 to-income/30 rounded-xl blur-md -z-10 animate-pulse" />
              )}
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
        
        {/* Store Buttons */}
        <div className="space-y-3">
          {/* App Store Button */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-all duration-500" />
            <Button
              onClick={() => window.open('https://apps.apple.com', '_blank')}
              className="relative w-full h-14 rounded-xl bg-black hover:bg-black/90 text-white transition-all duration-300 shadow-xl flex items-center justify-center gap-3 overflow-hidden border border-white/10 group-hover:border-white/20"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              
              {/* Apple Icon */}
              <svg className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-white/60 leading-none">Baixar na</span>
                <span className="text-base font-semibold leading-tight">App Store</span>
              </div>
            </Button>
          </div>
          
          {/* Google Play Button */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-income/30 to-primary/30 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-all duration-500" />
            <Button
              onClick={() => window.open('https://play.google.com/store', '_blank')}
              className="relative w-full h-14 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] hover:from-[#252525] hover:to-[#3a3a3a] text-white transition-all duration-300 shadow-xl flex items-center justify-center gap-3 overflow-hidden border border-white/10 group-hover:border-white/20"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              
              {/* Google Play Icon */}
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M3.609 1.814L13.793 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z"/>
                <path fill="#34A853" d="M16.247 15.168l-2.454-2.454L3.609 22.186c.324.166.72.166 1.044 0l11.594-7.018z"/>
                <path fill="#FBBC04" d="M20.063 10.633l-3.816-2.302-2.454 2.454 2.454 2.454 3.816-2.302a1.25 1.25 0 000-2.304z"/>
                <path fill="#EA4335" d="M3.609 1.814l10.184 10.184 2.454-2.454L4.653 1.814a1.055 1.055 0 00-1.044 0z"/>
              </svg>
              
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-white/60 leading-none">Disponível no</span>
                <span className="text-base font-semibold leading-tight">Google Play</span>
              </div>
            </Button>
          </div>
        </div>
        
        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <Shield className="w-3.5 h-3.5 text-income" />
          <p className="text-white/50 text-xs">
            Download seguro e verificado
          </p>
        </div>
        
        <p className="text-white/30 text-[11px] text-center mt-3">
          A versão web foi pensada para uso em computadores
        </p>
      </div>

      {/* Safe area bottom spacing for mobile */}
      <div className="safe-area-bottom" />
    </div>
  );
}
