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
    <div className="md:hidden">
      {/* Header com fundo primary */}
      <div className="bg-primary px-4 pt-4 pb-8 safe-area-top">
        <div className="flex items-center justify-between">
          {/* Avatar e Nome */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-card flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-foreground">{initials}</span>
            </div>
            <span className="text-lg font-semibold text-primary-foreground">
              {firstName}
            </span>
          </div>

          {/* Ícones de ação */}
          <div className="flex items-center gap-4">
            {/* Botão de mostrar/ocultar valores */}
            {onToggleValues && (
              <button
                onClick={onToggleValues}
                className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
                aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
              >
                {showValues ? (
                  <Eye className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <EyeOff className="w-6 h-6 text-primary-foreground" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curva de transição */}
      <div className="relative h-4 -mt-4">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-background rounded-t-3xl" />
      </div>
    </div>
  );
};
