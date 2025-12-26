import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff, Loader2, Mail, Shield, Check, Camera, X } from 'lucide-react';
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
  
  // Estado para avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache buster to URL
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlWithCacheBuster }
      });

      if (updateError) throw updateError;

      setAvatarUrl(urlWithCacheBuster);
      await refreshUser();

      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao atualizar o avatar.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setIsUploadingAvatar(true);
    try {
      // Remove from user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (updateError) throw updateError;

      setAvatarUrl(null);
      await refreshUser();

      toast({
        title: "Avatar removido",
        description: "Sua foto de perfil foi removida.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover avatar",
        description: error.message || "Ocorreu um erro ao remover o avatar.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
        {/* Card de Avatar */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Camera className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Foto de Perfil</CardTitle>
                <CardDescription className="text-sm">
                  Personalize sua conta com uma foto
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-5">
              {/* Avatar Preview */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-foreground" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {avatarUrl ? 'Alterar foto' : 'Escolher foto'}
                  </Button>
                  {avatarUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou GIF. Máximo 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Nome */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Nome de Usuário</CardTitle>
                <CardDescription className="text-sm">
                  Como você aparece no aplicativo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nome completo</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-10"
              />
            </div>
            <Button 
              onClick={handleUpdateName} 
              disabled={isUpdatingName}
              size="sm"
            >
              {isUpdatingName ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Nome'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Card de Email */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Endereço de Email</CardTitle>
                <CardDescription className="text-sm">
                  Seu email de acesso à conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg border border-border/50">
              <div>
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Email vinculado à sua conta
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border/50">
                Verificado
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card de Senha */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Alterar Senha</CardTitle>
                <CardDescription className="text-sm">
                  Mantenha sua conta segura
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">Senha atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="pr-10 h-10"
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
                  className="pr-10 h-10"
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
                    <span className="text-muted-foreground">
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { check: newPassword.length >= 8, label: '8+ caracteres' },
                      { check: /[A-Z]/.test(newPassword), label: 'Maiúscula' },
                      { check: /[a-z]/.test(newPassword), label: 'Minúscula' },
                      { check: /[0-9]/.test(newPassword), label: 'Número' },
                    ].map((req, i) => (
                      <span 
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded transition-colors ${
                          req.check 
                            ? 'bg-primary/10 text-primary' 
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
                  className={`pr-10 h-10 ${
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
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Senhas coincidem
                </p>
              )}
            </div>

            <Button 
              onClick={handleUpdatePassword} 
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword || passwordStrength < 100 || newPassword !== confirmPassword}
              size="sm"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Senha'
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