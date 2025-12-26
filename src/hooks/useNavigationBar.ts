import { useEffect } from 'react';
import { useTheme } from './useTheme';
import { Capacitor } from '@capacitor/core';

export const useNavigationBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const setNavigationBarColor = async () => {
      // Só executa em plataformas nativas (Android)
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        return;
      }

      try {
        // Import dinâmico para evitar erros em plataformas não-nativas
        const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
        
        // Cores baseadas no tema (mesma cor do card/nav)
        const darkColor = '#1a2332'; // hsl(220, 25%, 15%) aproximado
        const lightColor = '#ffffff';
        
        const backgroundColor = theme === 'dark' ? darkColor : lightColor;
        
        await NavigationBar.setNavigationBarColor({ 
          color: backgroundColor,
          darkButtons: theme === 'light' // Ícones escuros no tema claro
        });
      } catch (error) {
        console.log('NavigationBar plugin not available:', error);
      }
    };

    setNavigationBarColor();
  }, [theme]);
};
