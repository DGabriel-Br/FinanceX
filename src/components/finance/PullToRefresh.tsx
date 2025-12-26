import { ReactNode } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

export const PullToRefresh = ({ children, onRefresh, className }: PullToRefreshProps) => {
  const { pullDistance, isRefreshing, isPulling, handlers } = usePullToRefresh({
    onRefresh,
    threshold: 80,
  });

  const progress = Math.min(pullDistance / 80, 1);
  const isReady = progress >= 1;
  const showIndicator = pullDistance > 5 || isRefreshing;

  return (
    <div 
      className={cn("relative", className)}
      {...handlers}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ptr-pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        @keyframes ptr-success {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ptr-dots {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        .ptr-spinning {
          animation: ptr-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .ptr-pulse-ring {
          animation: ptr-pulse-ring 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center overflow-hidden z-40 pointer-events-none",
          "transition-opacity duration-300",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: Math.max(pullDistance, isRefreshing ? 64 : 0),
          top: 0,
        }}
      >
        {/* Background glow effect */}
        <div 
          className={cn(
            "absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/5 to-transparent transition-opacity duration-300",
            (isReady || isRefreshing) ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Main indicator container */}
        <div className="relative">
          {/* Outer pulsing ring - only when ready or refreshing */}
          {(isReady || isRefreshing) && (
            <div 
              className="absolute inset-0 rounded-full bg-primary/20 ptr-pulse-ring"
              style={{
                width: 48,
                height: 48,
                left: -4,
                top: -4,
              }}
            />
          )}

          {/* Main circle */}
          <div 
            className={cn(
              "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-out",
              isRefreshing 
                ? "bg-primary shadow-lg shadow-primary/30" 
                : isReady 
                  ? "bg-primary/90 shadow-lg shadow-primary/25"
                  : "bg-card border-2 border-primary/30 shadow-md"
            )}
            style={{
              transform: `scale(${0.6 + progress * 0.4})`,
            }}
          >
            {/* Progress arc background */}
            {!isRefreshing && (
              <svg 
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 40 40"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary/20"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={cn(
                    "text-primary transition-all duration-150",
                    isReady && "text-primary-foreground"
                  )}
                  style={{
                    strokeDasharray: `${progress * 113} 113`,
                  }}
                />
              </svg>
            )}

            {/* Icon */}
            <RefreshCw 
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isRefreshing 
                  ? "text-primary-foreground ptr-spinning" 
                  : isReady
                    ? "text-primary-foreground"
                    : "text-primary"
              )}
              style={{
                transform: isRefreshing 
                  ? undefined 
                  : `rotate(${pullDistance * 3}deg)`,
              }}
            />
          </div>

          {/* Loading dots */}
          {isRefreshing && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  style={{
                    animation: `ptr-dots 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pull hint text */}
        <div 
          className={cn(
            "absolute bottom-2 left-0 right-0 text-center text-xs font-medium transition-all duration-300",
            isRefreshing 
              ? "text-primary opacity-100" 
              : isReady 
                ? "text-primary opacity-100"
                : "text-muted-foreground opacity-70"
          )}
          style={{
            transform: `translateY(${isRefreshing ? 8 : 0}px)`,
            opacity: showIndicator && !isRefreshing ? Math.min(progress * 1.5, 1) : 0,
          }}
        >
          {isReady ? "Solte para atualizar" : "Puxe para atualizar"}
        </div>
      </div>

      {/* Content with pull offset */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{
          transform: showIndicator ? `translateY(${Math.min(pullDistance, 70)}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
