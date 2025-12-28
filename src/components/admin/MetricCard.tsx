import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: MetricCardProps) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p
            className={cn(
              'text-xs mt-1',
              trend === 'up' && 'text-income',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground',
              !trend && 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
