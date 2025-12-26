import { useEffect } from 'react';
import { useTheme } from './useTheme';
import { Capacitor } from '@capacitor/core';

export const useNavigationBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const configureNativeBars = async () => {
      // Só executa em plataformas nativas (Android)
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        return;
      }

      // Cores baseadas no tema
      const darkColor = '#1a2332'; // hsl(220, 25%, 15%) aproximado
      const lightColor = '#ffffff';
      const backgroundColor = theme === 'dark' ? darkColor : lightColor;

      // Configura Navigation Bar
      try {
        const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
        await NavigationBar.setNavigationBarColor({ 
          color: backgroundColor,
          darkButtons: theme === 'light'
        });
      } catch (error) {
        console.log('NavigationBar plugin not available:', error);
      }

      // Configura Status Bar
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        
        await StatusBar.setBackgroundColor({ color: backgroundColor });
        await StatusBar.setStyle({ 
          style: theme === 'dark' ? Style.Dark : Style.Light 
        });
      } catch (error) {
        console.log('StatusBar plugin not available:', error);
      }
    };

    configureNativeBars();
  }, [theme]);
};
