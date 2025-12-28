import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Shield, 
  Server,
  ChevronLeft,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Visão Geral', description: 'Métricas executivas' },
  { path: '/admin/usuarios', icon: Users, label: 'Usuários', description: 'Gerenciar usuários' },
  { path: '/admin/roles', icon: Crown, label: 'Roles', description: 'Permissões' },
  { path: '/admin/atividade', icon: TrendingUp, label: 'Atividade', description: 'Logs de ação' },
  { path: '/admin/seguranca', icon: Shield, label: 'Segurança', description: 'Auditoria' },
  { path: '/admin/sistema', icon: Server, label: 'Sistema', description: 'Configurações' },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col">
      {/* Header with Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex flex-col gap-3">
          {/* Logo igual à sidebar do usuário */}
          <div className="relative flex items-end flex-shrink-0 group justify-center">
            {/* Glow effect background */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-income/20 to-primary/20 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -inset-1 bg-gradient-to-r from-income/10 via-primary/15 to-income/10 rounded-lg blur-md animate-pulse" />
            
            <FinanceLogo size={32} className="relative drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <span 
              className="text-2xl font-black tracking-wider text-white -ml-0.5 relative drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              inanceX
            </span>
          </div>
          
          {/* Admin badge */}
          <div className="flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold tracking-wide border border-primary/30">
              Painel Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-3">
          Menu Principal
        </p>
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={cn(
              'group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300',
              'text-sidebar-foreground/70 hover:text-sidebar-foreground',
              'stagger-item',
              isActive(item.path) 
                ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-sidebar-foreground shadow-lg shadow-primary/10' 
                : 'hover:bg-sidebar-accent/50'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Active indicator */}
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
            )}
            
            <div className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300',
              'group-hover:scale-110',
              isActive(item.path) 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-sidebar-accent/30 text-sidebar-foreground/70 group-hover:bg-sidebar-accent'
            )}>
              <item.icon className="h-4.5 w-4.5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <span className={cn(
                'block font-medium text-sm transition-colors',
                isActive(item.path) && 'text-sidebar-foreground'
              )}>
                {item.label}
              </span>
              <span className="block text-xs text-sidebar-foreground/40 truncate">
                {item.description}
              </span>
            </div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="px-3 py-2 rounded-lg bg-sidebar-accent/30">
          <p className="text-xs text-sidebar-foreground/50">Status do Sistema</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-income rounded-full animate-pulse" />
            <span className="text-sm text-sidebar-foreground/80">Operacional</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Voltar ao App
        </Button>
      </div>
    </aside>
  );
};
