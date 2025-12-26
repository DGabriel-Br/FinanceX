import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detecta o tema inicial
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Observa mudanças no tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* Animações de entrada */
        [data-sonner-toast][data-mounted="true"] {
          animation: toast-slide-in 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }
        
        /* Animações de saída */
        [data-sonner-toast][data-removed="true"] {
          animation: toast-slide-out 0.3s cubic-bezier(0.06, 0.71, 0.55, 1) forwards;
        }
        
        /* Animação de entrada deslizando de baixo */
        @keyframes toast-slide-in {
          0% {
            opacity: 0;
            transform: translateY(100%) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Animação de saída deslizando para baixo */
        @keyframes toast-slide-out {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(50%) scale(0.9);
          }
        }

        /* Efeito de hover sutil */
        [data-sonner-toast]:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        /* Transição suave no hover */
        [data-sonner-toast] {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Ícone de sucesso pulsa */
        [data-sonner-toast][data-type="success"] [data-icon] {
          animation: success-pulse 0.5s ease-out;
        }

        @keyframes success-pulse {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        /* Ícone de erro shake */
        [data-sonner-toast][data-type="error"] [data-icon] {
          animation: error-shake 0.4s ease-out;
        }

        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }
      `}</style>
      <Sonner
        theme={theme}
        position="bottom-center"
        offset="140px"
        className="toaster group"
        expand={false}
        richColors={false}
        closeButton={true}
        duration={4000}
        gap={8}
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
            description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
            success: "group-[.toaster]:border-income/30 [&>div>svg]:text-income",
            error: "group-[.toaster]:border-expense/30 [&>div>svg]:text-expense",
            title: "group-[.toast]:font-semibold",
            closeButton: "group-[.toast]:bg-card group-[.toast]:border-border group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground",
          },
          style: {
            padding: '16px',
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster, toast };
