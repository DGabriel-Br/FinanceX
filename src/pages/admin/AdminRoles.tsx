import { useState } from 'react';
import { format } from 'date-fns';
import { Shield, ShieldOff, UserPlus, Loader2, Crown, Search, AlertTriangle, RefreshCw, Users, Sparkles } from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAdminsList, useManageAdminRole, useSyncMissingProfiles } from '@/hooks/useAdminRoles';
import { useUsersList } from '@/hooks/useAdminMetrics';
import { useAuthContext } from '@/contexts/AuthContext';

const AdminRoles = () => {
  const { user } = useAuthContext();
  const { data: admins, isLoading: loadingAdmins, error: adminsError, refetch: refetchAdmins } = useAdminsList();
  const { data: allUsers, isLoading: loadingUsers, refetch: refetchUsers } = useUsersList();
  const { addAdminRole, removeAdminRole } = useManageAdminRole();
  const syncProfiles = useSyncMissingProfiles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [actionType, setActionType] = useState<'add' | 'remove' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const adminUserIds = new Set(admins?.map(a => a.user_id) || []);
  
  const nonAdminUsers = allUsers?.filter(u => !adminUserIds.has(u.user_id)) || [];
  
  const filteredNonAdmins = nonAdminUsers.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;
    
    setIsProcessing(true);
    try {
      if (actionType === 'add') {
        await addAdminRole.mutateAsync(selectedUser.id);
        toast.success(`${selectedUser.email} foi promovido a administrador`);
      } else {
        await removeAdminRole.mutateAsync(selectedUser.id);
        toast.success(`${selectedUser.email} não é mais administrador`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar ação');
    } finally {
      setIsProcessing(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const handleSyncProfiles = async () => {
    setIsSyncing(true);
    try {
      const result = await syncProfiles.mutateAsync();
      const syncData = result[0];
      if (syncData && syncData.synced_count > 0) {
        toast.success(`${syncData.synced_count} perfil(is) sincronizado(s): ${syncData.synced_emails.join(', ')}`);
        refetchAdmins();
        refetchUsers();
      } else {
        toast.info('Todos os perfis já estão sincronizados');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar perfis');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  if (loadingAdmins) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Carregando roles...</p>
        </div>
      </AdminLayout>
    );
  }

  if (adminsError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-destructive font-medium">Erro ao carregar dados</p>
            <p className="text-sm text-muted-foreground mt-1">Tente novamente mais tarde</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Gerenciamento de Roles
              </h1>
              <p className="text-muted-foreground">
                Gerencie os administradores do sistema
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSyncProfiles}
            disabled={isSyncing}
            className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sincronizar Perfis
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="admin-card-gradient border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="text-3xl font-bold text-foreground">{admins?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="admin-card-gradient border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Comuns</p>
                  <p className="text-3xl font-bold text-primary">{nonAdminUsers.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="admin-card-gradient border-income/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-3xl font-bold text-income">{allUsers?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-income" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Admins */}
        <Card className="admin-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
              Administradores Atuais
            </CardTitle>
            <CardDescription>
              {admins?.length || 0} administrador(es) no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admins && admins.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Email</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Admin desde</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin, index) => (
                      <TableRow 
                        key={admin.user_id}
                        className="stagger-item hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-semibold text-sm">
                              {(admin.email?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              {admin.email}
                              {admin.user_id === user?.id && (
                                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                                  Você
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{admin.full_name || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(admin.role_created_at)}</TableCell>
                        <TableCell className="text-right">
                          {admin.user_id !== user?.id ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              onClick={() => {
                                setSelectedUser({ id: admin.user_id, email: admin.email || '' });
                                setActionType('remove');
                              }}
                            >
                              <ShieldOff className="h-4 w-4" />
                              Remover
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Não pode remover a si mesmo
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-muted-foreground">Nenhum administrador encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Admin */}
        <Card className="admin-card-gradient">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Promover Usuário a Administrador</CardTitle>
                  <CardDescription>
                    Selecione um usuário para conceder privilégios de administrador
                  </CardDescription>
                </div>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email ou nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNonAdmins.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Email</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Transações</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNonAdmins.slice(0, 10).map((userItem, index) => (
                      <TableRow 
                        key={userItem.user_id}
                        className="stagger-item hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {(userItem.email?.[0] || '?').toUpperCase()}
                            </div>
                            {userItem.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{userItem.full_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {userItem.transaction_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userItem.is_blocked ? (
                            <Badge variant="destructive" className="gap-1">
                              Bloqueado
                            </Badge>
                          ) : (
                            <Badge className="bg-income/10 text-income hover:bg-income/20 gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-income" />
                              Ativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            disabled={userItem.is_blocked}
                            className="gap-1.5"
                            onClick={() => {
                              setSelectedUser({ id: userItem.user_id, email: userItem.email || '' });
                              setActionType('add');
                            }}
                          >
                            <Shield className="h-4 w-4" />
                            Promover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {searchQuery ? `Nenhum usuário encontrado para "${searchQuery}"` : 'Todos os usuários já são administradores'}
                </p>
              </div>
            )}

            {filteredNonAdmins.length > 10 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Mostrando 10 de {filteredNonAdmins.length} usuários. Use a busca para filtrar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {actionType === 'add' ? (
                <Shield className="h-5 w-5 text-primary" />
              ) : (
                <ShieldOff className="h-5 w-5 text-destructive" />
              )}
              {actionType === 'add' ? 'Promover a Administrador' : 'Remover Privilégios de Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'add' ? (
                <>
                  Você está prestes a conceder privilégios de administrador para{' '}
                  <strong className="text-foreground">{selectedUser?.email}</strong>. Administradores têm acesso completo 
                  ao painel de controle e podem gerenciar outros usuários.
                </>
              ) : (
                <>
                  Você está prestes a remover os privilégios de administrador de{' '}
                  <strong className="text-foreground">{selectedUser?.email}</strong>. Esta ação pode ser revertida posteriormente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={actionType === 'remove' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : actionType === 'add' ? (
                <Shield className="h-4 w-4 mr-2" />
              ) : (
                <ShieldOff className="h-4 w-4 mr-2" />
              )}
              {actionType === 'add' ? 'Promover' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminRoles;
