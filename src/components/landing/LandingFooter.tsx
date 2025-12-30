import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

export const LandingFooter = memo(function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.04] py-10 lg:py-12 bg-landing-dark">
      <div className="w-full max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/" className="flex items-end group transition-opacity duration-300 hover:opacity-70">
              <FinanceLogo size={24} className="lg:w-7 lg:h-7" />
              <span 
                className="text-base lg:text-lg font-black tracking-wider -ml-0.5 text-white/90"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                inanceX
              </span>
            </Link>
            <span className="hidden md:inline text-white/20">|</span>
            <span className="hidden md:inline text-xs lg:text-sm text-white/30">
              © {new Date().getFullYear()} Todos os direitos reservados.
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 lg:gap-8">
            <span className="md:hidden text-xs text-white/30">
              © {new Date().getFullYear()} FinanceX. Todos os direitos reservados.
            </span>
            <nav className="flex items-center gap-6 lg:gap-8 text-xs lg:text-sm text-white/40" aria-label="Footer navigation">
              <Link to="/termos" className="hover:text-white/70 transition-colors duration-300">
                Termos de uso
              </Link>
              <Link to="/privacidade" className="hover:text-white/70 transition-colors duration-300">
                Privacidade
              </Link>
              <a href="mailto:contato@financex.com" className="hover:text-white/70 transition-colors duration-300">
                Contato
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
});
