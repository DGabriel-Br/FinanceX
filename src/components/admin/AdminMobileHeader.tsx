import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

const pageTitles: Record<string, string> = {
  '/admin': 'Visão Geral',
  '/admin/usuarios': 'Usuários',
  '/admin/roles': 'Permissões',
  '/admin/atividade': 'Atividade',
  '/admin/seguranca': 'Segurança',
  '/admin/sistema': 'Sistema',
};

export const AdminMobileHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const title = pageTitles[location.pathname] || 'Admin';

  return (
    <header className="sticky top-0 z-50 bg-card safe-area-top">
      <div className="px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="text-foreground -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2 flex-1">
          <FinanceLogo size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <span className="text-lg font-semibold text-foreground">{title}</span>
        </div>
        
        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
          Admin
        </span>
      </div>
      
      {/* Curva de transição */}
      <div className="relative h-4">
        <div className="absolute inset-0 bg-card" />
        <div className="absolute inset-0 bg-background rounded-t-3xl" />
      </div>
    </header>
  );
};
