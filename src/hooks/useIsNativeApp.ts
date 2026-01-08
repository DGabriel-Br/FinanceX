/**
 * Hook que detecta se o app está rodando como aplicativo nativo (Capacitor/WebView)
 * Retorna true apenas quando rodando em um dispositivo móvel via Capacitor
 * Otimizado para detecção síncrona imediata
 */

// Detecção síncrona no carregamento do módulo (mais rápido que useMemo)
const detectMobileExperience = (): boolean => {
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
  
  // Detecta navegador mobile (para unificar experiência web mobile com app nativo)
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth < 768;
  const isMobileBrowser = isMobileDevice && isSmallScreen;
  
  // É "nativo" se Capacitor, WebView OU navegador mobile
  return hasCapacitor || isAndroidWebView || isIOSWebView || isMobileBrowser;
};

// Valor calculado uma única vez no carregamento do módulo
const IS_MOBILE_EXPERIENCE = detectMobileExperience();

export function useIsNativeApp(): boolean {
  return IS_MOBILE_EXPERIENCE;
}
