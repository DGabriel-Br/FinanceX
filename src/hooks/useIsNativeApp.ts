import { useMemo } from 'react';

/**
 * Hook que detecta se o app está rodando como aplicativo nativo (Capacitor/WebView)
 * Retorna true apenas quando rodando em um dispositivo móvel via Capacitor
 */
export function useIsNativeApp(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Verifica se está rodando no Capacitor (método mais confiável)
    const capacitor = (window as any).Capacitor;
    const hasCapacitor = capacitor?.isNativePlatform?.() === true || 
                         capacitor?.getPlatform?.() === 'android' || 
                         capacitor?.getPlatform?.() === 'ios';
    
    // Verifica User Agent para WebView Android/iOS
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidWebView = userAgent.includes('wv') || 
      (userAgent.includes('android') && userAgent.includes('version/'));
    const isIOSWebView = /(iphone|ipod|ipad).*applewebkit(?!.*safari)/i.test(navigator.userAgent);
    
    // É nativo se Capacitor detectar OU se estiver em WebView
    return hasCapacitor || isAndroidWebView || isIOSWebView;
  }, []);
}
