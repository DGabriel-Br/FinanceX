import { Search, Bell, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  userName?: string;
  userEmail?: string;
  showValues?: boolean;
  onToggleValues?: () => void;
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
  onToggleValues 
}: MobileHeaderProps) => {
  const initials = getInitials(userName, userEmail);
  const firstName = getFirstName(userName, userEmail);

  return (
    <div className="md:hidden w-full">
      {/* Header com fundo primary */}
      <div className="bg-primary safe-area-top">
        {/* Conteúdo do header */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between w-full">
            {/* Avatar e Nome */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-sm font-bold text-foreground">{initials}</span>
              </div>
              <span className="text-base font-semibold text-primary-foreground truncate">
                {firstName}
              </span>
            </div>

            {/* Ícones de ação */}
            <div className="flex items-center flex-shrink-0">
              {/* Botão de mostrar/ocultar valores */}
              {onToggleValues && (
                <button
                  onClick={onToggleValues}
                  className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
                  aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
                >
                  {showValues ? (
                    <Eye className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-primary-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curva de transição */}
      <div className="relative h-4 -mt-0">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-background rounded-t-3xl" />
      </div>
    </div>
  );
};
