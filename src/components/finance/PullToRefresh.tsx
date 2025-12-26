import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

export const PullToRefresh = ({ children, onRefresh, className }: PullToRefreshProps) => {
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  const progress = Math.min(pullDistance / 80, 1);
  const showIndicator = pullDistance > 5 || isRefreshing;

  return (
    <div 
      className={cn("relative", className)}
      {...handlers}
    >
      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center z-40 pointer-events-none",
          "transition-all duration-300 ease-out"
        )}
        style={{
          height: Math.max(pullDistance, isRefreshing ? 56 : 0),
          top: 0,
          opacity: showIndicator ? 1 : 0,
        }}
      >
        <div 
          className={cn(
            "flex items-center justify-center transition-all duration-200",
          )}
          style={{
            transform: `scale(${0.6 + progress * 0.4}) rotate(${pullDistance * 3}deg)`,
          }}
        >
          <Loader2 
            className={cn(
              "w-6 h-6 text-primary transition-opacity duration-200",
              isRefreshing && "animate-[spin_1.5s_linear_infinite]"
            )}
            style={{
              opacity: 0.4 + progress * 0.6,
            }}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{
          transform: showIndicator ? `translateY(${Math.min(pullDistance, 56)}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
};