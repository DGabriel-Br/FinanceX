import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isNativeApp = useIsNativeApp();

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
        /* Posicionamento do container de toasts para app nativo */
        ${isNativeApp ? `
        [data-sonner-toaster] {
          bottom: 120px !important;
        }
        ` : ''}

        /* Animações de entrada - arrasta suavemente para cima */
        [data-sonner-toast][data-mounted="true"] {
          animation: toast-drag-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        
        /* Animações de saída - arrasta suavemente para baixo */
        [data-sonner-toast][data-removed="true"] {
          animation: toast-drag-down 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        
        /* Animação de entrada - efeito de arrastar para cima */
        @keyframes toast-drag-up {
          0% {
            opacity: 0;
            transform: translateY(120px) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px) scale(1.02);
          }
          75% {
            transform: translateY(4px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Animação de saída - efeito de arrastar para baixo */
        @keyframes toast-drag-down {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          30% {
            opacity: 1;
            transform: translateY(-8px) scale(1.01);
          }
          100% {
            opacity: 0;
            transform: translateY(120px) scale(0.9);
          }
        }

        /* Efeito de hover sutil */
        [data-sonner-toast]:hover {
          transform: scale(1.02) translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        /* Transição suave para interações */
        [data-sonner-toast] {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
        offset={isNativeApp ? "500px" : "200px"}
        className="toaster group"
        expand={false}
        richColors={false}
        closeButton={true}
        duration={5000}
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
