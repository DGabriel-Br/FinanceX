import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
];

export const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 group">
          <FinanceLogo size={28} className="transition-transform group-hover:scale-105" />
          <span 
            className="text-xl font-black tracking-wide text-foreground"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            inanceX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/cadastro">Criar conta grátis</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          mobileMenuOpen ? 'max-h-80' : 'max-h-0'
        )}
      >
        <nav className="container flex flex-col gap-4 py-4 border-t border-border">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            <Button variant="outline" asChild className="w-full">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="w-full">
              <Link to="/cadastro">Criar conta grátis</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};
