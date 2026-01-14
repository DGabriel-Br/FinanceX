import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

export const LandingHeader = memo(function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-landing-dark/70 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-8">
        <div className="h-16 lg:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-end group transition-opacity duration-300 hover:opacity-80">
            <FinanceLogo size={28} className="lg:w-8 lg:h-8" />
            <span 
              className="text-lg lg:text-xl font-black tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          </Link>
          <div className="flex items-center gap-2 lg:gap-3">
            <Button 
              variant="ghost" 
              asChild 
              className="text-white/60 hover:text-white hover:bg-white/[0.04] font-medium text-sm px-3 lg:px-4 transition-all duration-300"
            >
              <Link to="/login">Entrar</Link>
            </Button>
            <Button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:inline-flex rounded-full px-5 lg:px-6 h-9 lg:h-10 bg-gradient-to-r from-landing-cyan to-landing-teal text-landing-dark font-semibold text-sm hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all duration-500 border-0"
            >
              Começar agora
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});
