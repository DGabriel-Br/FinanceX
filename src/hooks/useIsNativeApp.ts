/**
 * Hook que detecta se o app está rodando como aplicativo nativo (Capacitor/WebView)
 * Retorna true apenas quando rodando em um dispositivo móvel via Capacitor
 * Otimizado para detecção síncrona imediata
 */

// Detecção síncrona no carregamento do módulo (mais rápido que useMemo)
const detectNativeApp = (): boolean => {
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
};

// Valor calculado uma única vez no carregamento do módulo
const IS_NATIVE_APP = detectNativeApp();

export function useIsNativeApp(): boolean {
  return IS_NATIVE_APP;
}
