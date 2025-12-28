import { NavLink, useNavigate } from 'react-router-dom';
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

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Visão Geral' },
  { path: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { path: '/admin/roles', icon: Crown, label: 'Roles' },
  { path: '/admin/atividade', icon: TrendingUp, label: 'Atividade' },
  { path: '/admin/seguranca', icon: Shield, label: 'Segurança' },
  { path: '/admin/sistema', icon: Server, label: 'Sistema' },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          FinanceX Admin
        </h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">
          Painel de Controle
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="h-5 w-5 mr-3" />
          Voltar ao App
        </Button>
      </div>
    </aside>
  );
};
