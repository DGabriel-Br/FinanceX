import { ReactNode } from 'react';
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
      {/* CSS Animations - Instagram inspired */}
      <style>{`
        @keyframes ptr-gradient-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ptr-scale-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ptr-scale-out {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.3); opacity: 0; }
        }
        @keyframes ptr-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .ptr-gradient-spin {
          animation: ptr-gradient-spin 1s linear infinite;
        }
        .ptr-scale-in {
          animation: ptr-scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .ptr-scale-out {
          animation: ptr-scale-out 0.3s ease-out forwards;
        }
      `}</style>

      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center overflow-hidden z-40 pointer-events-none",
          "transition-all duration-300 ease-out"
        )}
        style={{
          height: Math.max(pullDistance, isRefreshing ? 72 : 0),
          top: 0,
          opacity: showIndicator ? 1 : 0,
        }}
      >
        {/* Subtle glow background */}
        <div 
          className={cn(
            "absolute inset-x-0 top-0 h-24 transition-opacity duration-500",
            (isReady || isRefreshing) ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: 'radial-gradient(ellipse at center top, hsl(var(--primary) / 0.12) 0%, transparent 70%)',
          }}
        />

        {/* Main indicator container */}
        <div 
          className={cn(
            "relative flex items-center justify-center",
            isRefreshing && "ptr-scale-in"
          )}
          style={{
            transform: !isRefreshing ? `scale(${0.5 + progress * 0.5})` : undefined,
            transition: !isRefreshing ? 'transform 0.15s ease-out' : undefined,
          }}
        >
          {/* Gradient ring */}
          <div 
            className={cn(
              "relative w-10 h-10 rounded-full",
              isRefreshing && "ptr-gradient-spin"
            )}
            style={{
              transform: !isRefreshing ? `rotate(${pullDistance * 4}deg)` : undefined,
              transition: !isRefreshing ? 'transform 0.1s ease-out' : undefined,
            }}
          >
            {/* Gradient border using conic gradient */}
            <svg 
              className="w-full h-full"
              viewBox="0 0 40 40"
            >
              <defs>
                <linearGradient id="ptr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="25%" stopColor="hsl(280, 85%, 60%)" />
                  <stop offset="50%" stopColor="hsl(330, 90%, 55%)" />
                  <stop offset="75%" stopColor="hsl(20, 95%, 55%)" />
                  <stop offset="100%" stopColor="hsl(45, 95%, 55%)" />
                </linearGradient>
                <linearGradient id="ptr-gradient-dim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary) / 0.4)" />
                  <stop offset="50%" stopColor="hsl(var(--muted-foreground) / 0.3)" />
                  <stop offset="100%" stopColor="hsl(var(--primary) / 0.4)" />
                </linearGradient>
              </defs>
              
              {/* Background track */}
              <circle
                cx="20"
                cy="20"
                r="17"
                fill="none"
                stroke="url(#ptr-gradient-dim)"
                strokeWidth="2.5"
                className="opacity-30"
              />
              
              {/* Progress/spinning arc */}
              <circle
                cx="20"
                cy="20"
                r="17"
                fill="none"
                stroke="url(#ptr-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-150"
                style={{
                  strokeDasharray: isRefreshing 
                    ? '80 107' 
                    : `${Math.max(progress * 85, 8)} 107`,
                  strokeDashoffset: isRefreshing ? '0' : '25',
                  opacity: isRefreshing || progress > 0.1 ? 1 : 0,
                }}
                transform="rotate(-90 20 20)"
              />
            </svg>

            {/* Center dot that scales with progress */}
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "transition-all duration-200"
              )}
            >
              <div 
                className={cn(
                  "rounded-full transition-all duration-300",
                  isRefreshing 
                    ? "w-2 h-2 bg-gradient-to-br from-primary to-primary/60" 
                    : isReady
                      ? "w-3 h-3 bg-gradient-to-br from-primary to-primary/80"
                      : "w-2 h-2 bg-muted-foreground/40"
                )}
                style={{
                  transform: `scale(${0.5 + progress * 0.5})`,
                  boxShadow: isReady || isRefreshing 
                    ? '0 0 8px hsl(var(--primary) / 0.5)' 
                    : 'none',
                }}
              />
            </div>
          </div>

          {/* Shimmer effect when refreshing */}
          {isRefreshing && (
            <div 
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'ptr-shimmer 1.5s ease-in-out infinite',
              }}
            />
          )}
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