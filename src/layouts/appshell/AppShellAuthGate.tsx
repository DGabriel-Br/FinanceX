import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface AppShellAuthGateProps {
  children: ReactNode;
}

/**
 * Responsável por validar sessão e redirecionar usuário não autenticado
 */
export const AppShellAuthGate = ({ children }: AppShellAuthGateProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Se ainda carregando ou sem usuário, não renderiza conteúdo
  if (authLoading) {
    return null; // Loading será tratado pelo componente pai
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
