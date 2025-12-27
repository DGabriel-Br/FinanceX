import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook que configura a cor da barra de navegação do Android
 * para combinar com o tema do app
 */
export function useNavigationBar(theme: 'light' | 'dark') {
  useEffect(() => {
    const configureNavigationBar = async () => {
      // Só executa em plataforma nativa Android
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        return;
      }

      try {
        const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
        
        // Define a barra de navegação como transparente
        // Usa cor hexadecimal com alpha 0 para garantir transparência em ambos os temas
        await NavigationBar.setNavigationBarColor({
          color: '#00000000',
          darkButtons: theme === 'light', // botões escuros no tema claro
        });
      } catch (error) {
        console.log('NavigationBar plugin not available:', error);
      }
    };

    configureNavigationBar();
  }, [theme]);
}
