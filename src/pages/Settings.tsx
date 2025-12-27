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
  Cog, 
  LogOut,
  Mail,
  Sun,
  Moon,
  Tag,
  ChevronRight,
  Bell,
  Globe,
  DollarSign,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { getInitials } from '@/lib/userUtils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { useCustomCategories } from '@/hooks/useCustomCategories';
import { incomeCategoryLabels, expenseCategoryLabels } from '@/types/transaction';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type SettingsSection = 'profile' | 'security' | 'preferences' | 'categories' | null;


export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, refreshUser, signOut } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const isNativeApp = useIsNativeApp();
  
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

  // Layout para App Nativo (com cards)
  if (isNativeApp) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header com botão voltar */}
        <header className="sticky top-0 z-50 bg-card safe-area-top">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Perfil</h1>
          </div>
          {/* Curva de transição */}
          <div className="relative h-4">
            <div className="absolute inset-0 bg-card" />
            <div className="absolute inset-0 bg-background rounded-t-3xl" />
          </div>
        </header>

        {/* Profile Section */}
        <div className="flex flex-col items-center pt-8 pb-10 px-4">
          {/* Avatar */}
          <div className="relative mb-6">
            <div 
              className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer transition-transform active:scale-95"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-muted-foreground">
                  {getInitials(displayName, user?.email)}
                </span>
              )}
            </div>
            
            {/* Camera icon overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-95 transition-all"
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
          <h2 className="text-xl font-semibold text-foreground mb-1 text-center">
            {displayName}
          </h2>

          {/* Email */}
          <p className="text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>

        {/* Settings Cards */}
        <div className="flex-1 px-4">
          <h3 className="text-sm font-semibold text-foreground mb-4 animate-fade-in opacity-0" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}>
            Configurações
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-8">
            {/* Card Dados Pessoais */}
            <button
              onClick={() => setActiveSection('profile')}
              className="group flex flex-col items-start justify-between p-4 bg-muted rounded-2xl hover:bg-muted/80 active:scale-[0.97] transition-all h-[100px] animate-fade-in opacity-0"
              style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
            >
              <User className="w-6 h-6 text-primary stroke-[1.5]" />
              <span className="text-xs font-medium text-foreground leading-tight text-left">
                Dados<br />pessoais
              </span>
            </button>

            {/* Card Segurança */}
            <button
              onClick={() => setActiveSection('security')}
              className="group flex flex-col items-start justify-between p-4 bg-muted rounded-2xl hover:bg-muted/80 active:scale-[0.97] transition-all h-[100px] animate-fade-in opacity-0"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <Shield className="w-6 h-6 text-primary stroke-[1.5]" />
              <span className="text-xs font-medium text-foreground leading-tight text-left">
                Segurança
              </span>
            </button>

            {/* Card Preferências */}
            <button
              onClick={() => setActiveSection('preferences')}
              className="group flex flex-col items-start justify-between p-4 bg-muted rounded-2xl hover:bg-muted/80 active:scale-[0.97] transition-all h-[100px] animate-fade-in opacity-0"
              style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
            >
              <Cog className="w-6 h-6 text-primary stroke-[1.5]" />
              <span className="text-xs font-medium text-foreground leading-tight text-left">
                Preferências
              </span>
            </button>
          </div>

          {/* Versão do app */}
          <p className="text-xs text-muted-foreground text-center animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            FinanceX v1.0.0
          </p>
        </div>

        {/* Logout Button */}
        <div className="px-4 pb-6 pt-2 safe-area-bottom animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Sair do app</span>
            <LogOut className="w-5 h-5 ml-auto" />
          </Button>
        </div>

        {/* Sheets para app nativo */}
        <Sheet open={activeSection === 'profile'} onOpenChange={(open) => !open && setActiveSection(null)}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="text-left mb-6">
              <SheetTitle>Dados pessoais</SheetTitle>
              <SheetDescription>Atualize suas informações de perfil</SheetDescription>
            </SheetHeader>
            <ProfileSheetContent
              avatarUrl={avatarUrl}
              displayName={displayName}
              user={user}
              name={name}
              setName={setName}
              fileInputRef={fileInputRef}
              isUploadingAvatar={isUploadingAvatar}
              handleRemoveAvatar={handleRemoveAvatar}
              handleUpdateName={handleUpdateName}
              isUpdatingName={isUpdatingName}
            />
          </SheetContent>
        </Sheet>

        <Sheet open={activeSection === 'security'} onOpenChange={(open) => !open && setActiveSection(null)}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader className="text-left mb-6">
              <SheetTitle>Segurança</SheetTitle>
              <SheetDescription>Altere sua senha de acesso</SheetDescription>
            </SheetHeader>
            <SecuritySheetContent
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              showCurrentPassword={showCurrentPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordStrength={passwordStrength}
              handleUpdatePassword={handleUpdatePassword}
              isUpdatingPassword={isUpdatingPassword}
            />
          </SheetContent>
        </Sheet>

        <Sheet open={activeSection === 'preferences'} onOpenChange={(open) => !open && setActiveSection(null)}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
            <SheetHeader className="text-left mb-6">
              <SheetTitle>Preferências</SheetTitle>
              <SheetDescription>Personalize sua experiência</SheetDescription>
            </SheetHeader>
            <PreferencesSheetContent
              theme={theme}
              toggleTheme={toggleTheme}
              setActiveSection={setActiveSection}
            />
          </SheetContent>
        </Sheet>

        <Sheet open={activeSection === 'categories'} onOpenChange={(open) => !open && setActiveSection(null)}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto p-0">
            <div className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b border-border">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveSection(null);
                      setTimeout(() => setActiveSection('preferences'), 150);
                    }}
                    className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <SheetTitle>Gerenciar Categorias</SheetTitle>
                </div>
                <SheetDescription>Organize suas categorias de receitas e despesas</SheetDescription>
              </SheetHeader>
            </div>
            <div className="p-6">
              <CategoryManagerInline />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Layout para Web (com accordions)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-semibold text-muted-foreground">
                    {getInitials(displayName, user?.email)}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-all"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Camera className="w-3 h-3" />
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
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <Accordion type="single" collapsible className="space-y-3">
          {/* Dados Pessoais */}
          <AccordionItem value="profile" className="bg-card rounded-xl border border-border px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Dados pessoais</p>
                  <p className="text-xs text-muted-foreground">Atualize suas informações</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="name-web">Nome completo</Label>
                  <Input
                    id="name-web"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg border border-border/50">
                    <span className="text-sm">{user?.email}</span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Verificado</span>
                  </div>
                </div>
                <Button onClick={handleUpdateName} disabled={isUpdatingName} className="w-full">
                  {isUpdatingName ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : 'Salvar alterações'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Segurança */}
          <AccordionItem value="security" className="bg-card rounded-xl border border-border px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Segurança</p>
                  <p className="text-xs text-muted-foreground">Altere sua senha</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword-web">Senha atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword-web"
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
                  <Label htmlFor="newPassword-web">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword-web"
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
                  <Label htmlFor="confirmPassword-web">Confirmar nova senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword-web"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className={cn('pr-10', confirmPassword && newPassword !== confirmPassword && 'border-destructive focus-visible:ring-destructive')}
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
                </div>
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword || passwordStrength < 100 || newPassword !== confirmPassword}
                  className="w-full"
                >
                  {isUpdatingPassword ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Atualizando...</> : 'Atualizar senha'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Preferências */}
          <AccordionItem value="preferences" className="bg-card rounded-xl border border-border px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cog className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Preferências</p>
                  <p className="text-xs text-muted-foreground">Personalize sua experiência</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                    <span className="text-sm font-medium">Tema escuro</span>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
                <button
                  onClick={() => setActiveSection('categories')}
                  className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Gerenciar categorias</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Logout Button */}
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full h-12 text-base font-medium rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>

        {/* Version */}
        <p className="text-xs text-muted-foreground text-center">FinanceX v1.0.0</p>
      </div>

      {/* Sheet para categorias na web */}
      <Sheet open={activeSection === 'categories'} onOpenChange={(open) => !open && setActiveSection(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="text-left mb-6">
            <SheetTitle>Gerenciar Categorias</SheetTitle>
            <SheetDescription>Organize suas categorias de receitas e despesas</SheetDescription>
          </SheetHeader>
          <CategoryManagerInline />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Componentes auxiliares para os sheets do app nativo
function ProfileSheetContent({ avatarUrl, displayName, user, name, setName, fileInputRef, isUploadingAvatar, handleRemoveAvatar, handleUpdateName, isUpdatingName }: any) {
  return (
    <div className="space-y-6">
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
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}>
            {avatarUrl ? 'Alterar' : 'Adicionar'}
          </Button>
          {avatarUrl && (
            <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} disabled={isUploadingAvatar}>
              Remover
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg border border-border/50">
          <span className="text-sm">{user?.email}</span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Verificado</span>
        </div>
      </div>
      <Button onClick={handleUpdateName} disabled={isUpdatingName} className="w-full">
        {isUpdatingName ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : 'Salvar alterações'}
      </Button>
    </div>
  );
}

function SecuritySheetContent({ currentPassword, setCurrentPassword, showCurrentPassword, setShowCurrentPassword, newPassword, setNewPassword, showNewPassword, setShowNewPassword, confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, passwordStrength, handleUpdatePassword, isUpdatingPassword }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <div className="relative">
          <Input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" className="pr-10" autoFocus={false} />
          <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova senha</Label>
        <div className="relative">
          <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="pr-10" />
          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrengthMeter password={newPassword} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <div className="relative">
          <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" className={cn('pr-10', confirmPassword && newPassword !== confirmPassword && 'border-destructive focus-visible:ring-destructive')} />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-destructive">As senhas não coincidem</p>}
        {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Check className="w-3 h-3" />Senhas coincidem</p>
        )}
      </div>
      <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword || passwordStrength < 100 || newPassword !== confirmPassword} className="w-full">
        {isUpdatingPassword ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Atualizando...</> : 'Atualizar senha'}
      </Button>
    </div>
  );
}

function PreferencesSheetContent({ theme, toggleTheme, setActiveSection }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Tema escuro</p>
            <p className="text-xs text-muted-foreground">{theme === 'dark' ? 'Ativado' : 'Desativado'}</p>
          </div>
        </div>
        <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
      </div>
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl animate-fade-in opacity-0" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Notificações</p>
            <p className="text-xs text-muted-foreground">Lembretes e alertas</p>
          </div>
        </div>
        <Switch checked={false} disabled />
      </div>
      <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl opacity-60 cursor-not-allowed animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }} disabled>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Idioma</p>
            <p className="text-xs text-muted-foreground">Português (Brasil)</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
      <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl opacity-60 cursor-not-allowed animate-fade-in" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }} disabled>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Moeda</p>
            <p className="text-xs text-muted-foreground">Real (R$)</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
      <button onClick={() => { setActiveSection(null); setTimeout(() => setActiveSection('categories'), 150); }} className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted active:scale-[0.98] transition-all animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Gerenciar categorias</p>
            <p className="text-xs text-muted-foreground">Organize receitas e despesas</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
      <p className="text-xs text-muted-foreground text-center pt-4 animate-fade-in opacity-0" style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
        Algumas opções estarão disponíveis em breve
      </p>
    </div>
  );
}


// Inline version of CategoryManager for the sheet
function CategoryManagerInline() {
  const { 
    loading, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    getCategoriesByType,
    hideDefaultCategory,
    getVisibleDefaultCategories,
    getSortedCategories,
    updateCategoryOrder,
  } = useCustomCategories();
  
  const [activeTab, setActiveTab] = useState<'receita' | 'despesa'>('receita');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsSubmitting(true);
    const success = await addCategory(newCategoryName, activeTab);
    setIsSubmitting(false);
    
    if (success) {
      setNewCategoryName('');
      setIsAddDialogOpen(false);
    }
  };

  const defaultIncomeCategories = Object.entries(incomeCategoryLabels) as [string, string][];
  const defaultExpenseCategories = Object.entries(expenseCategoryLabels) as [string, string][];
  
  const visibleIncomeDefaults = getVisibleDefaultCategories('receita', defaultIncomeCategories);
  const visibleExpenseDefaults = getVisibleDefaultCategories('despesa', defaultExpenseCategories);
  
  const customIncomeCategories = getCategoriesByType('receita');
  const customExpenseCategories = getCategoriesByType('despesa');

  const sortedIncomeCategories = getSortedCategories('receita', visibleIncomeDefaults, customIncomeCategories);
  const sortedExpenseCategories = getSortedCategories('despesa', visibleExpenseDefaults, customExpenseCategories);

  const currentCategories = activeTab === 'receita' ? sortedIncomeCategories : sortedExpenseCategories;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
        <button
          onClick={() => setActiveTab('receita')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
            activeTab === 'receita' 
              ? 'bg-emerald-500 text-white shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Receitas
        </button>
        <button
          onClick={() => setActiveTab('despesa')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
            activeTab === 'despesa' 
              ? 'bg-rose-500 text-white shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Despesas
        </button>
      </div>

      {/* Add button */}
      <Button
        onClick={() => {
          setNewCategoryName('');
          setIsAddDialogOpen(true);
        }}
        className="w-full"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Categoria
      </Button>

      {/* Categories list */}
      <div className="space-y-2">
        {currentCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{category.name}</span>
              {category.isDefault && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                  padrão
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentCategories.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Nenhuma categoria
        </div>
      )}

      {/* Add Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nova Categoria</h3>
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione uma categoria de {activeTab === 'receita' ? 'receita' : 'despesa'}
            </p>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Freelance, Alimentação..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategoryName.trim()) {
                  handleAdd();
                }
              }}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAdd} disabled={isSubmitting || !newCategoryName.trim()} className="flex-1">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

