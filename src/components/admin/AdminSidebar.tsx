import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Shield, 
  Server,
  ChevronLeft,
  ChevronRight,
  Crown,
  Wifi,
  WifiOff,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FinanceLogo } from '@/components/ui/FinanceLogo';
import { useAdminPresence } from '@/hooks/useAdminPresence';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ADMIN_SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

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
  const { isOnline, onlineAdmins } = useAdminPresence();
  
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getEmailName = (email: string) => {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "bg-sidebar border-r border-sidebar-border h-screen flex flex-col transition-[width] duration-300 ease-in-out relative sticky top-0",
        collapsed ? "w-[72px]" : "w-72"
      )}>
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-md border-2 border-background"
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Header with Logo */}
        <div className={cn(
          "h-32 flex items-center justify-center border-b border-sidebar-border",
          collapsed && "px-2"
        )}>
          <div className="flex flex-col gap-3 items-center">
            {/* Logo */}
            <div className="relative flex items-end flex-shrink-0 group justify-center">
              {/* Glow effect background */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-income/20 to-primary/20 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-income/10 via-primary/15 to-income/10 rounded-lg blur-md animate-pulse" />
              
              <FinanceLogo size={collapsed ? 36 : 32} className="relative drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              {!collapsed && (
                <span 
                  className="text-2xl font-black tracking-wider text-white -ml-0.5 relative drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  inanceX
                </span>
              )}
            </div>
            
            {/* Admin badge */}
            {!collapsed && (
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold tracking-wide border border-primary/30">
                Painel Admin
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 p-4 space-y-1.5", collapsed && "px-2")}>
          {!collapsed && (
            <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-3">
              Menu Principal
            </p>
          )}
          {navItems.map((item, index) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300',
                    'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                    'stagger-item',
                    collapsed && 'justify-center px-0',
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
                  
                  {!collapsed && (
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
                  )}
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn("p-4 border-t border-sidebar-border space-y-3", collapsed && "px-2")}>
          {/* User Status */}
          {!collapsed ? (
            <div className="px-3 py-2.5 rounded-lg bg-sidebar-accent/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <div className="relative">
                      <Wifi className="h-4 w-4 text-income" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-income rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <WifiOff className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="text-xs text-sidebar-foreground/50">Seu Status</p>
                    <p className={cn(
                      "text-sm font-medium",
                      isOnline ? "text-income" : "text-destructive"
                    )}>
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                {onlineAdmins.length > 0 && (
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs text-primary font-medium">
                          {onlineAdmins.length} admin{onlineAdmins.length > 1 ? 's' : ''}
                        </span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="top" 
                      align="end" 
                      className="w-64 p-0 bg-popover border border-border shadow-xl"
                    >
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-income rounded-full animate-pulse" />
                          <h4 className="text-sm font-semibold text-foreground">
                            Admins Online ({onlineAdmins.length})
                          </h4>
                        </div>
                      </div>
                      <div className="p-2 max-h-48 overflow-y-auto">
                        {onlineAdmins.map((admin) => (
                          <div 
                            key={admin.user_id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-income/30">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {getEmailName(admin.email)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {admin.email}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70">
                                Online há {formatDistanceToNow(new Date(admin.online_at), { locale: ptBR })}
                              </p>
                            </div>
                            <div className="w-2 h-2 bg-income rounded-full flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-2">
                  {isOnline ? (
                    <div className="relative">
                      <Wifi className="h-5 w-5 text-income" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-income rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <WifiOff className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isOnline ? 'Online' : 'Offline'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* System Status */}
          {!collapsed ? (
            <div className="px-3 py-2 rounded-lg bg-sidebar-accent/30">
              <p className="text-xs text-sidebar-foreground/50">Status do Sistema</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-income rounded-full animate-pulse" />
                <span className="text-sm text-sidebar-foreground/80">Operacional</span>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-2">
                  <div className="w-3 h-3 bg-income rounded-full animate-pulse" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Sistema Operacional
              </TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group",
                  collapsed ? "justify-center px-0" : "justify-start"
                )}
                onClick={() => navigate('/dashboard')}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform group-hover:-translate-x-1", !collapsed && "mr-2")} />
                {!collapsed && "Voltar ao App"}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                Voltar ao App
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};
