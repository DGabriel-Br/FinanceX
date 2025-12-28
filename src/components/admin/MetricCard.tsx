import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  delay?: number;
}

const variantStyles = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    border: 'border-border',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    border: 'border-primary/20',
  },
  success: {
    iconBg: 'bg-income/10',
    iconColor: 'text-income',
    border: 'border-income/20',
  },
  warning: {
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    border: 'border-yellow-500/20',
  },
  info: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    border: 'border-blue-500/20',
  },
};

export const MetricCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
  variant = 'default',
  delay = 0,
}: MetricCardProps) => {
  const styles = variantStyles[variant];
  
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-6',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
        'admin-card-gradient',
        styles.border,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300',
            'group-hover:scale-110 group-hover:rotate-3',
            styles.iconBg
          )}>
            <div className={styles.iconColor}>
              {icon}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground tracking-tight animate-count-up">
              {value}
            </span>
            {trend && (
              <div className={cn(
                'flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full',
                trend === 'up' && 'bg-income/10 text-income',
                trend === 'down' && 'bg-destructive/10 text-destructive',
                trend === 'neutral' && 'bg-muted text-muted-foreground',
              )}>
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {trend === 'neutral' && <Minus className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </div>
  );
};
