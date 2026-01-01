import { FinanceLogo } from '@/components/ui/FinanceLogo';

interface AppShellLoadingScreenProps {
  message?: string;
}

/**
 * Tela de splash/loading
 */
export const AppShellLoadingScreen = ({ 
  message = 'Carregando seu controle financeiro...' 
}: AppShellLoadingScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative mb-6">
        <div className="relative flex items-end">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-income/20 to-primary/20 rounded-2xl blur-2xl animate-pulse" />
          <FinanceLogo size={48} className="relative" />
          <span 
            className="text-3xl font-black tracking-wider text-foreground -ml-1 relative"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            inanceX
          </span>
        </div>
        <div className="absolute -inset-4 rounded-3xl border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute -inset-5 rounded-3xl border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
      </div>
      
      <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {message}
      </p>
      
      <div className="w-48 h-1 bg-muted rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-income to-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};
