import { useState } from 'react';
import { format } from 'date-fns';
import { Shield, ShieldOff, UserPlus, Loader2, Crown, Search, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAdminsList, useManageAdminRole } from '@/hooks/useAdminRoles';
import { useUsersList } from '@/hooks/useAdminMetrics';
import { useAuthContext } from '@/contexts/AuthContext';

const AdminRoles = () => {
  const { user } = useAuthContext();
  const { data: admins, isLoading: loadingAdmins, error: adminsError } = useAdminsList();
  const { data: allUsers, isLoading: loadingUsers } = useUsersList();
  const { addAdminRole, removeAdminRole } = useManageAdminRole();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [actionType, setActionType] = useState<'add' | 'remove' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  if (loadingAdmins) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (adminsError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-destructive">
          Erro ao carregar dados de administradores
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Roles</h1>
          <p className="text-muted-foreground">Gerencie os administradores do sistema</p>
        </div>

        {/* Current Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Administradores Atuais
            </CardTitle>
            <CardDescription>
              {admins?.length || 0} administrador(es) no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admins && admins.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Admin desde</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {admin.email}
                          {admin.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs">Você</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{admin.full_name || '-'}</TableCell>
                      <TableCell>{formatDate(admin.role_created_at)}</TableCell>
                      <TableCell className="text-right">
                        {admin.user_id !== user?.id ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser({ id: admin.user_id, email: admin.email || '' });
                              setActionType('remove');
                            }}
                          >
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Não pode remover a si mesmo
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p>Nenhum administrador encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Promover Usuário a Administrador
            </CardTitle>
            <CardDescription>
              Selecione um usuário para conceder privilégios de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário por email ou nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredNonAdmins.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Transações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNonAdmins.slice(0, 10).map((userItem) => (
                    <TableRow key={userItem.user_id}>
                      <TableCell className="font-medium">{userItem.email}</TableCell>
                      <TableCell>{userItem.full_name || '-'}</TableCell>
                      <TableCell>{userItem.transaction_count}</TableCell>
                      <TableCell>
                        {userItem.is_blocked ? (
                          <Badge variant="destructive">Bloqueado</Badge>
                        ) : (
                          <Badge variant="secondary">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          disabled={userItem.is_blocked}
                          onClick={() => {
                            setSelectedUser({ id: userItem.user_id, email: userItem.email || '' });
                            setActionType('add');
                          }}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Promover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? (
                  <p>Nenhum usuário encontrado para "{searchQuery}"</p>
                ) : (
                  <p>Todos os usuários já são administradores</p>
                )}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'add' ? 'Promover a Administrador' : 'Remover Privilégios de Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'add' ? (
                <>
                  Você está prestes a conceder privilégios de administrador para{' '}
                  <strong>{selectedUser?.email}</strong>. Administradores têm acesso completo 
                  ao painel de controle e podem gerenciar outros usuários.
                </>
              ) : (
                <>
                  Você está prestes a remover os privilégios de administrador de{' '}
                  <strong>{selectedUser?.email}</strong>. Esta ação pode ser revertida posteriormente.
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
