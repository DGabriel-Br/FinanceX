import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useState, useEffect } from 'react';

/**
 * Componente temporário para debug - mostra status de detecção nativa e online/offline
 * REMOVER após debug
 */
export const DebugOverlay = () => {
  const isNativeApp = useIsNativeApp();
  const { isOnline } = useOnlineStatus();
  const [capacitorInfo, setCapacitorInfo] = useState<{
    hasCapacitor: boolean;
    platform: string | null;
    isNativePlatform: boolean | null;
  }>({
    hasCapacitor: false,
    platform: null,
    isNativePlatform: null
  });

  useEffect(() => {
    const capacitor = (window as any).Capacitor;
    setCapacitorInfo({
      hasCapacitor: !!capacitor,
      platform: capacitor?.getPlatform?.() || null,
      isNativePlatform: capacitor?.isNativePlatform?.() ?? null
    });
  }, []);

  return (
    <div className="fixed bottom-28 left-2 z-[200] bg-black/80 text-white text-xs p-2 rounded-lg max-w-[200px] font-mono">
      <div className="font-bold text-yellow-400 mb-1">🔧 DEBUG</div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isNativeApp ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>isNativeApp: {isNativeApp ? 'SIM' : 'NÃO'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>isOnline: {isOnline ? 'SIM' : 'NÃO'}</span>
        </div>
        
        <div className="border-t border-white/20 pt-1 mt-1">
          <div>Capacitor: {capacitorInfo.hasCapacitor ? 'SIM' : 'NÃO'}</div>
          <div>Platform: {capacitorInfo.platform || 'null'}</div>
          <div>isNative: {String(capacitorInfo.isNativePlatform)}</div>
        </div>
        
        <div className="border-t border-white/20 pt-1 mt-1 text-[10px] text-gray-400">
          navigator.onLine: {String(navigator.onLine)}
        </div>
      </div>
    </div>
  );
};
