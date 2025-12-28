import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUsersList, useBlockUser, UserListItem } from '@/hooks/useAdminMetrics';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Ban, UserCheck, Users, Search, UserX, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminUsers = () => {
  const { data: users, isLoading, error } = useUsersList();
  const { blockUser, unblockUser } = useBlockUser();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [actionType, setActionType] = useState<'block' | 'unblock' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === 'block') {
        await blockUser(selectedUser.user_id);
        toast.success('Usuário bloqueado com sucesso');
      } else {
        await unblockUser(selectedUser.user_id);
        toast.success('Usuário desbloqueado com sucesso');
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (error) {
      toast.error('Erro ao processar ação');
      console.error(error);
    } finally {
      setIsProcessing(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Carregando usuários...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <UserX className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-destructive font-medium">Erro ao carregar usuários</p>
            <p className="text-sm text-muted-foreground mt-1">Tente novamente mais tarde</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const activeUsers = users?.filter(u => !u.is_blocked).length || 0;
  const blockedUsers = users?.filter(u => u.is_blocked).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Usuários
              </h1>
              <p className="text-muted-foreground">
                Gerenciamento de usuários do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="admin-card-gradient border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-3xl font-bold text-foreground">{users?.length || 0}</p>
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
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-income">{activeUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-income" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="admin-card-gradient border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bloqueados</p>
                  <p className="text-3xl font-bold text-destructive">{blockedUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Ban className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card className="admin-card-gradient">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                  {filteredUsers.length} usuário(s) encontrado(s)
                </CardDescription>
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
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Email</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Último login</TableHead>
                    <TableHead className="text-center">Transações</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user.user_id} 
                      className="stagger-item hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {(user.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p>{user.email ?? 'Sem email'}</p>
                            {user.full_name && (
                              <p className="text-xs text-muted-foreground">{user.full_name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.last_sign_in_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {user.transaction_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.is_blocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
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
                        <div className="flex justify-end gap-2">
                          {user.is_blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 hover:bg-income/10 hover:text-income hover:border-income/30"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType('unblock');
                              }}
                            >
                              <UserCheck className="h-4 w-4" />
                              Desbloquear
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType('block');
                              }}
                            >
                              <Ban className="h-4 w-4" />
                              Bloquear
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">
                              {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                            </p>
                            {searchQuery && (
                              <p className="text-sm text-muted-foreground/70">
                                Tente buscar por outro termo
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog 
        open={!!selectedUser && !!actionType} 
        onOpenChange={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {actionType === 'block' ? (
                <Ban className="h-5 w-5 text-destructive" />
              ) : (
                <UserCheck className="h-5 w-5 text-income" />
              )}
              {actionType === 'block' ? 'Bloquear Usuário' : 'Desbloquear Usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'block' 
                ? `Tem certeza que deseja bloquear ${selectedUser?.email}? O usuário não poderá acessar o sistema.`
                : `Tem certeza que deseja desbloquear ${selectedUser?.email}? O usuário poderá acessar o sistema novamente.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={actionType === 'block' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-income text-white hover:bg-income/90'}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'block' ? 'Bloquear' : 'Desbloquear'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsers;
