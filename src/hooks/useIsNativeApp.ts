/**
 * Detecta se o app está rodando como aplicativo nativo (Capacitor/WebView)
 * Retorna true apenas quando rodando em um dispositivo móvel via Capacitor
 */

const checkNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Verifica se está rodando no Capacitor
  const hasCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
  
  // Verifica User Agent para WebView Android/iOS
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroidWebView = userAgent.includes('wv') || 
    (userAgent.includes('android') && userAgent.includes('version/'));
  const isIOSWebView = /(iphone|ipod|ipad).*applewebkit(?!.*safari)/i.test(navigator.userAgent);
  
  // É nativo se Capacitor detectar OU se estiver em WebView
  return hasCapacitor || isAndroidWebView || isIOSWebView;
};

// Valor calculado uma vez na inicialização
const isNativeApp = checkNativeApp();

export function useIsNativeApp(): boolean {
  return isNativeApp;
}
