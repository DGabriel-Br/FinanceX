import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCustomCategories, CustomCategory } from '@/hooks/useCustomCategories';
import { incomeCategoryLabels, expenseCategoryLabels } from '@/types/transaction';

export function CategoryManager() {
  const { categories, loading, addCategory, updateCategory, deleteCategory, getCategoriesByType } = useCustomCategories();
  const [activeTab, setActiveTab] = useState<'receita' | 'despesa'>('receita');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CustomCategory | null>(null);
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

  const handleEdit = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    setIsSubmitting(true);
    const success = await updateCategory(editingCategory.id, editingCategory.name);
    setIsSubmitting(false);
    
    if (success) {
      setEditingCategory(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    setIsSubmitting(true);
    await deleteCategory(deletingCategory.id);
    setIsSubmitting(false);
    setDeletingCategory(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (category: CustomCategory) => {
    setEditingCategory({ ...category });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: CustomCategory) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const defaultIncomeCategories = Object.entries(incomeCategoryLabels);
  const defaultExpenseCategories = Object.entries(expenseCategoryLabels);
  const customIncomeCategories = getCategoriesByType('receita');
  const customExpenseCategories = getCategoriesByType('despesa');

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Gerenciar Categorias
          </CardTitle>
          <CardDescription>
            Adicione, edite ou exclua suas categorias personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'receita' | 'despesa')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="receita">Receitas</TabsTrigger>
              <TabsTrigger value="despesa">Despesas</TabsTrigger>
            </TabsList>

            <TabsContent value="receita" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-muted-foreground">Categorias Padrão</h4>
              </div>
              <div className="grid gap-2">
                {defaultIncomeCategories.map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm">{label}</span>
                    <span className="text-xs text-muted-foreground">Padrão</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Categorias Personalizadas</h4>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewCategoryName('');
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {customIncomeCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria personalizada de receita
                </p>
              ) : (
                <div className="grid gap-2">
                  {customIncomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between px-3 py-2 bg-accent/30 rounded-lg"
                    >
                      <span className="text-sm">{category.name}</span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="despesa" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-muted-foreground">Categorias Padrão</h4>
              </div>
              <div className="grid gap-2">
                {defaultExpenseCategories.map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm">{label}</span>
                    <span className="text-xs text-muted-foreground">Padrão</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Categorias Personalizadas</h4>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewCategoryName('');
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {customExpenseCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria personalizada de despesa
                </p>
              ) : (
                <div className="grid gap-2">
                  {customExpenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between px-3 py-2 bg-accent/30 rounded-lg"
                    >
                      <span className="text-sm">{category.name}</span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria de {activeTab === 'receita' ? 'Receita' : 'Despesa'}</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria personalizada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Bônus, Entretenimento..."
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting || !newCategoryName.trim()}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Altere o nome da categoria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">Nome da Categoria</Label>
              <Input
                id="editCategoryName"
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Nome da categoria"
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting || !editingCategory?.name.trim()}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
