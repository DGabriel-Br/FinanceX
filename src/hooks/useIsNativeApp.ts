/**
 * Hooks para detecção de plataforma
 * - useIsNativeApp: retorna true APENAS para app Capacitor real
 * - useIsMobileExperience: retorna true para app nativo OU navegador mobile
 */

// Detecção de app nativo real (Capacitor/WebView)
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
  
  // É nativo APENAS se Capacitor ou WebView
  return hasCapacitor || isAndroidWebView || isIOSWebView;
};

// Detecção de experiência mobile (app nativo OU navegador mobile)
const detectMobileExperience = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Primeiro verifica se é app nativo
  if (IS_NATIVE_APP) return true;
  
  // Detecta navegador mobile (para unificar experiência web mobile com app nativo)
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth < 768;
  
  return isMobileDevice && isSmallScreen;
};

// Valores calculados uma única vez no carregamento do módulo
const IS_NATIVE_APP = detectNativeApp();
const IS_MOBILE_EXPERIENCE = detectMobileExperience();

/**
 * Retorna true APENAS para app nativo real (Capacitor/WebView)
 * Use para: redirecionamentos de rota, recursos exclusivos do app
 */
export function useIsNativeApp(): boolean {
  return IS_NATIVE_APP;
}

/**
 * Retorna true para app nativo OU navegador mobile
 * Use para: UI/UX (navegação, layout, animações)
 */
export function useIsMobileExperience(): boolean {
  return IS_MOBILE_EXPERIENCE;
}
