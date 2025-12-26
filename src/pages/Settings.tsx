import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, Loader2, Mail, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CategoryManager } from '@/components/finance/CategoryManager';
import { Progress } from '@/components/ui/progress';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, refreshUser } = useAuthContext();
  
  // Estado para nome
  const [name, setName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  
  // Estado para senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-destructive';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };
  const getStrengthLabel = () => {
    if (passwordStrength <= 25) return 'Fraca';
    if (passwordStrength <= 50) return 'Razoável';
    if (passwordStrength <= 75) return 'Boa';
    return 'Forte';
  };

  const handleUpdateName = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast({
        title: "Nome inválido",
        description: "O nome deve ter pelo menos 2 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() }
      });

      if (error) throw error;

      await refreshUser();

      toast({
        title: "Nome atualizado",
        description: "Seu nome foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar nome",
        description: error.message || "Ocorreu um erro ao atualizar o nome.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast({
        title: "Senha atual obrigatória",
        description: "Por favor, informe sua senha atual.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 100) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter 8+ caracteres, maiúsculas, minúsculas e números.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (verifyError) {
        toast({
          title: "Senha atual incorreta",
          description: "A senha atual informada está incorreta.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro ao atualizar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-mobile-header safe-area-top">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-mobile-header-foreground hover:bg-mobile-header-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-mobile-header-foreground">
            Configurações do Perfil
          </h1>
        </div>
        {/* Curva de transição */}
        <div className="relative h-4">
          <div className="absolute inset-0 bg-mobile-header" />
          <div className="absolute inset-0 bg-background rounded-t-3xl" />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto pb-24">
        {/* Card de Nome */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-transparent border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Nome de Usuário</CardTitle>
                <CardDescription>
                  Como você aparece no aplicativo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nome completo</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-11"
              />
            </div>
            <Button 
              onClick={handleUpdateName} 
              disabled={isUpdatingName}
              className="w-full sm:w-auto gap-2"
            >
              {isUpdatingName ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Salvar Nome
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Card de Email */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Endereço de Email</CardTitle>
                <CardDescription>
                  Seu email de acesso à conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl border border-border/30">
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Email vinculado à sua conta
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Verificado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Senha */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-transparent border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Alterar Senha</CardTitle>
                <CardDescription>
                  Mantenha sua conta segura
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">Senha atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Força da senha</span>
                    <span className={`font-medium ${passwordStrength === 100 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { check: newPassword.length >= 8, label: '8+ caracteres' },
                      { check: /[A-Z]/.test(newPassword), label: 'Maiúscula' },
                      { check: /[a-z]/.test(newPassword), label: 'Minúscula' },
                      { check: /[0-9]/.test(newPassword), label: 'Número' },
                    ].map((req, i) => (
                      <span 
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                          req.check 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {req.check && <Check className="w-3 h-3 inline mr-0.5" />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className={`pr-10 h-11 ${
                    confirmPassword && newPassword !== confirmPassword 
                      ? 'border-destructive focus-visible:ring-destructive' 
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
              {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Senhas coincidem
                </p>
              )}
            </div>

            <Button 
              onClick={handleUpdatePassword} 
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword || passwordStrength < 100 || newPassword !== confirmPassword}
              className="w-full sm:w-auto gap-2"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Atualizar Senha
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Category Manager */}
        <CategoryManager />
      </main>
    </div>
  );
}