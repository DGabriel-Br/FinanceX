import { Navigate } from "react-router-dom";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

interface NativeRedirectProps {
  webElement: React.ReactNode;
  nativeRedirectTo: string;
}

/**
 * Componente que renderiza conteúdo diferente baseado na plataforma.
 * No app nativo, redireciona para a rota especificada.
 * Na web, renderiza o elemento passado.
 * 
 * Renderiza null durante a detecção para evitar flash branco.
 */
export function NativeRedirect({ webElement, nativeRedirectTo }: NativeRedirectProps) {
  const isNativeApp = useIsNativeApp();

  // App nativo: redireciona imediatamente sem renderizar nada
  if (isNativeApp) {
    return <Navigate to={nativeRedirectTo} replace />;
  }

  return <>{webElement}</>;
}