import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/finance/PullToRefresh';
import { OfflineModal } from '@/components/finance/OfflineModal';

type SlideDirection = 'left' | 'right' | 'none';

interface AppShellLayoutProps {
  children: ReactNode;
  isNativeApp: boolean;
  activeTab: string;
  slideDirection: SlideDirection;
  onPullRefresh?: () => Promise<void>;
  navigationSlot?: ReactNode;
  mobileNavSlot?: ReactNode;
}

/**
 * Responsável pela estrutura visual e slots
 */
export const AppShellLayout = ({
  children,
  isNativeApp,
  activeTab,
  slideDirection,
  onPullRefresh,
  navigationSlot,
  mobileNavSlot,
}: AppShellLayoutProps) => {
  const contentWithAnimation = (
    <div 
      key={activeTab} 
      className={cn(
        "flex-1 max-w-full",
        // Animações de transição entre abas (apenas para native app)
        isNativeApp && slideDirection === 'left' && "animate-slide-in-right",
        isNativeApp && slideDirection === 'right' && "animate-slide-in-left",
        isNativeApp && slideDirection === 'none' && "animate-fade-in"
      )}
    >
      {children}
    </div>
  );

  return (
    <>
      {isNativeApp && <OfflineModal />}
      
      <div className={`flex ${isNativeApp ? 'flex-col' : ''} min-h-screen w-full relative`}>
        {/* Navigation slot - Sidebar para desktop */}
        {!isNativeApp && navigationSlot}

        {/* Mobile Header slot */}
        {isNativeApp && navigationSlot}

        {/* Conteúdo principal */}
        <main 
          className={cn(
            "flex-1 flex flex-col overflow-auto overflow-x-hidden",
            isNativeApp ? "pb-mobile-nav bg-background" : "bg-background"
          )}
        >
          {isNativeApp && onPullRefresh ? (
            <PullToRefresh onRefresh={onPullRefresh} className="flex-1">
              {contentWithAnimation}
            </PullToRefresh>
          ) : (
            contentWithAnimation
          )}
        </main>

        {/* Mobile Nav slot */}
        {isNativeApp && mobileNavSlot}
      </div>
    </>
  );
};
