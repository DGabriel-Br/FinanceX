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
        
        // Define a cor da barra de navegação baseado no tema
        // Tema escuro: fundo escuro com botões claros
        // Tema claro: fundo claro com botões escuros
        const backgroundColor = theme === 'dark' ? '#0f1419' : '#f5f7fa';
        
        await NavigationBar.setNavigationBarColor({
          color: backgroundColor,
          darkButtons: theme === 'light', // botões escuros no tema claro
        });
      } catch (error) {
        console.log('NavigationBar plugin not available:', error);
      }
    };

    configureNavigationBar();
  }, [theme]);
}
