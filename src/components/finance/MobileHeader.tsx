import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface MobileHeaderProps {
  userName?: string;
  userEmail?: string;
  showValues?: boolean;
  onToggleValues?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// Função para extrair iniciais do nome ou email
const getInitials = (name?: string, email?: string): string => {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'US';
};

// Função para extrair primeiro nome do email
const getFirstName = (name?: string, email?: string): string => {
  if (name) {
    return name.split(' ')[0];
  }
  if (email) {
    const localPart = email.split('@')[0];
    // Capitaliza a primeira letra
    return localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase();
  }
  return 'Usuário';
};

export const MobileHeader = ({ 
  userName, 
  userEmail, 
  showValues = true,
  onToggleValues,
  theme = 'light',
  onToggleTheme
}: MobileHeaderProps) => {
  const initials = getInitials(userName, userEmail);
  const firstName = getFirstName(userName, userEmail);
  const { scrollDirection, isAtTop } = useScrollDirection({ threshold: 15 });

  // Header visível quando: no topo, rolando para cima, ou direção ainda não definida
  const isVisible = isAtTop || scrollDirection === 'up' || scrollDirection === null;

  return (
    <div 
      className={cn(
        "md:hidden w-full sticky top-0 z-50 transition-all duration-300 ease-out",
        isVisible ? "translate-y-0" : "-translate-y-full",
        !isAtTop && "shadow-md"
      )}
    >
      {/* Header com fundo mobile-header */}
      <div className="bg-mobile-header safe-area-top">
        {/* Conteúdo do header */}
        <div className="px-4 py-5">
          <div className="flex items-center justify-between w-full">
            {/* Avatar e Nome */}
            <Link to="/settings" className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-sm font-bold text-foreground">{initials}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-mobile-header-foreground/70">
                  Bem-vindo(a),
                </span>
                <span className="text-base font-semibold text-mobile-header-foreground truncate uppercase">
                  {firstName}
                </span>
              </div>
            </Link>

            {/* Ícones de ação */}
            <div className="flex items-center flex-shrink-0 gap-1">
              {/* Botão de alternar tema */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="p-2 rounded-full hover:bg-mobile-header-foreground/10 transition-colors"
                  aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
                >
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-mobile-header-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-mobile-header-foreground" />
                  )}
                </button>
              )}
              
              {/* Botão de mostrar/ocultar valores */}
              {onToggleValues && (
                <button
                  onClick={onToggleValues}
                  className="p-2 rounded-full hover:bg-mobile-header-foreground/10 transition-colors"
                  aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
                >
                  {showValues ? (
                    <Eye className="w-5 h-5 text-mobile-header-foreground" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-mobile-header-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curva de transição */}
      <div className="relative h-4 -mt-0">
        <div className="absolute inset-0 bg-mobile-header" />
        <div className="absolute inset-0 bg-background rounded-t-3xl" />
      </div>
    </div>
  );
};
