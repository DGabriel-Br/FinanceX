import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Loader2, 
  Camera, 
  User, 
  Check, 
  Shield, 
  Settings2, 
  LogOut,
  ChevronRight,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { getInitials } from '@/lib/userUtils';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type SettingsSection = 'profile' | 'security' | 'preferences' | null;

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, refreshUser, signOut } = useAuthContext();
  
  // Estado para seção ativa
  const [activeSection, setActiveSection] = useState<SettingsSection>(null);
  
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

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/avatar-${timestamp}.${fileExt}`;

      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refreshUser();

      toast.success('Foto de perfil atualizada.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setIsUploadingAvatar(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (updateError) throw updateError;

      setAvatarUrl(null);
      await refreshUser();

      toast.success('Foto de perfil removida.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const handleUpdateName = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setIsUpdatingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() }
      });

      if (error) throw error;

      await refreshUser();
      toast.success('Nome atualizado.');
      setActiveSection(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar nome.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error('Informe sua senha atual.');
      return;
    }

    if (passwordStrength < 100) {
      toast.error('A senha deve ter 8+ caracteres, maiúsculas, minúsculas e números.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (verifyError) {
        toast.error('Senha atual incorreta.');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Senha atualizada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast.error('Erro ao sair da conta.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header com botão voltar */}
      <header className="sticky top-0 z-50 bg-background safe-area-top border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Perfil</h1>
        </div>
      </header>

      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        {/* Avatar */}
        <div className="relative mb-4">
          <div 
            className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">
                {getInitials(displayName, user?.email)}
              </span>
            )}
          </div>
          
          {/* Camera button overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Nome */}
        <h2 className="text-xl font-semibold text-foreground mb-1">
          {displayName}
        </h2>

        {/* Email */}
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          {user?.email}
        </p>
      </div>

      {/* Settings Cards */}
      <div className="flex-1 px-4 pb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
          Configurações
        </h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Card Dados Pessoais */}
          <button
            onClick={() => setActiveSection('profile')}
            className="flex flex-col items-start p-4 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground leading-tight">
              Dados pessoais
            </span>
          </button>

          {/* Card Segurança */}
          <button
            onClick={() => setActiveSection('security')}
            className="flex flex-col items-start p-4 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground leading-tight">
              Segurança
            </span>
          </button>

          {/* Card Preferências */}
          <button
            onClick={() => setActiveSection('preferences')}
            className="flex flex-col items-start p-4 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground leading-tight">
              Preferências
            </span>
          </button>
        </div>

        {/* Versão do app */}
        <p className="text-xs text-muted-foreground text-center mb-4">
          FinanceX v1.0.0
        </p>
      </div>

      {/* Logout Button */}
      <div className="px-4 pb-8 safe-area-bottom">
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full h-12 text-base font-medium"
        >
          <span>Sair do app</span>
          <LogOut className="w-5 h-5 ml-auto" />
        </Button>
      </div>

      {/* Sheet - Dados Pessoais */}
      <Sheet open={activeSection === 'profile'} onOpenChange={(open) => !open && setActiveSection(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="text-left mb-6">
            <SheetTitle>Dados pessoais</SheetTitle>
            <SheetDescription>Atualize suas informações de perfil</SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {getInitials(displayName, user?.email)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {avatarUrl ? 'Alterar' : 'Adicionar'}
                </Button>
                {avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg border border-border/50">
                <span className="text-sm">{user?.email}</span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Verificado
                </span>
              </div>
            </div>

            <Button 
              onClick={handleUpdateName} 
              disabled={isUpdatingName}
              className="w-full"
            >
              {isUpdatingName ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet - Segurança */}
      <Sheet open={activeSection === 'security'} onOpenChange={(open) => !open && setActiveSection(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader className="text-left mb-6">
            <SheetTitle>Segurança</SheetTitle>
            <SheetDescription>Altere sua senha de acesso</SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="pr-10"
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
              <Label htmlFor="newPassword">Nova senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className={cn(
                    'pr-10',
                    confirmPassword && newPassword !== confirmPassword && 'border-destructive focus-visible:ring-destructive'
                  )}
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
              className="w-full"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                'Atualizar senha'
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet - Preferências */}
      <Sheet open={activeSection === 'preferences'} onOpenChange={(open) => !open && setActiveSection(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader className="text-left mb-6">
            <SheetTitle>Preferências</SheetTitle>
            <SheetDescription>Personalize sua experiência</SheetDescription>
          </SheetHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center py-8">
              Em breve você poderá personalizar categorias, notificações e mais.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
