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
import { Loader2, Ban, UserCheck, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminUsers = () => {
  const { data: users, isLoading, error } = useUsersList();
  const { blockUser, unblockUser } = useBlockUser();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [actionType, setActionType] = useState<'block' | 'unblock' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar usuários</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de usuários do sistema
          </p>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Último login</TableHead>
                <TableHead className="text-center">Transações</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user.email ?? 'Sem email'}
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                  <TableCell className="text-center">
                    {user.transaction_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.is_blocked ? (
                      <Badge variant="destructive">Bloqueado</Badge>
                    ) : (
                      <Badge variant="default" className="bg-income">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.is_blocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('unblock');
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Desbloquear
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('block');
                          }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Bloquear
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog 
        open={!!selectedUser && !!actionType} 
        onOpenChange={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
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
              className={actionType === 'block' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
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
