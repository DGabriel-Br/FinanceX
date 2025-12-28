import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Shield, 
  Server,
  ChevronLeft,
  Crown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-income rounded-full border-2 border-sidebar" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 bg-clip-text">
              FinanceX Admin
            </h1>
            <p className="text-xs text-sidebar-foreground/50">
              Painel de Controle
            </p>
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
