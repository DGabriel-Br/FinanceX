import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Shield, 
  Server,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Geral' },
  { path: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { path: '/admin/roles', icon: Crown, label: 'Roles' },
  { path: '/admin/atividade', icon: TrendingUp, label: 'Atividade' },
  { path: '/admin/seguranca', icon: Shield, label: 'Segurança' },
  { path: '/admin/sistema', icon: Server, label: 'Sistema' },
];

export const AdminMobileNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[52px] transition-all',
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
              isActive(item.path) && 'bg-primary/15'
            )}>
              <item.icon className={cn(
                'w-5 h-5 transition-all',
                isActive(item.path) && 'scale-110'
              )} />
            </div>
            <span className={cn(
              'text-[10px] font-medium leading-tight',
              isActive(item.path) && 'text-primary font-semibold'
            )}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
