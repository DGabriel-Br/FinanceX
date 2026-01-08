import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISSED_EXPIRY_DAYS = 7;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) return false;
    
    const dismissedDate = new Date(dismissed);
    const now = new Date();
    const diffDays = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Reset after expiry period
    if (diffDays > DISMISSED_EXPIRY_DAYS) {
      localStorage.removeItem(DISMISSED_KEY);
      return false;
    }
    return true;
  });
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
  }, []);

  const canShowPrompt = isInstallable && !isDismissed && !isInstalled;

  return {
    isInstallable,
    isInstalled,
    isDismissed,
    canShowPrompt,
    install,
    dismiss,
  };
}
