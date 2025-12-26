import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Loader2, RotateCcw, EyeOff } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCustomCategories, CustomCategory } from '@/hooks/useCustomCategories';
import { incomeCategoryLabels, expenseCategoryLabels } from '@/types/transaction';

export function CategoryManager() {
  const { 
    loading, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    getCategoriesByType,
    hideDefaultCategory,
    restoreDefaultCategory,
    getVisibleDefaultCategories,
    getHiddenDefaultCategories,
  } = useCustomCategories();
  
  const [activeTab, setActiveTab] = useState<'receita' | 'despesa'>('receita');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHideDefaultDialogOpen, setIsHideDefaultDialogOpen] = useState(false);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CustomCategory | null>(null);
  const [hidingDefault, setHidingDefault] = useState<{ key: string; label: string; type: 'receita' | 'despesa' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Collapsible states
  const [isHiddenOpen, setIsHiddenOpen] = useState(false);

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

  const handleHideDefault = async () => {
    if (!hidingDefault) return;
    
    setIsSubmitting(true);
    await hideDefaultCategory(hidingDefault.key, hidingDefault.type);
    setIsSubmitting(false);
    setHidingDefault(null);
    setIsHideDefaultDialogOpen(false);
  };

  const handleRestoreDefault = async (key: string, type: 'receita' | 'despesa') => {
    setIsSubmitting(true);
    await restoreDefaultCategory(key, type);
    setIsSubmitting(false);
  };

  const openEditDialog = (category: CustomCategory) => {
    setEditingCategory({ ...category });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: CustomCategory) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const openHideDefaultDialog = (key: string, label: string, type: 'receita' | 'despesa') => {
    setHidingDefault({ key, label, type });
    setIsHideDefaultDialogOpen(true);
  };

  const defaultIncomeCategories = Object.entries(incomeCategoryLabels) as [string, string][];
  const defaultExpenseCategories = Object.entries(expenseCategoryLabels) as [string, string][];
  
  const visibleIncomeDefaults = getVisibleDefaultCategories('receita', defaultIncomeCategories);
  const visibleExpenseDefaults = getVisibleDefaultCategories('despesa', defaultExpenseCategories);
  const hiddenIncomeDefaults = getHiddenDefaultCategories('receita', defaultIncomeCategories);
  const hiddenExpenseDefaults = getHiddenDefaultCategories('despesa', defaultExpenseCategories);
  
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

  const renderCategoryList = (
    type: 'receita' | 'despesa',
    visibleDefaults: [string, string][],
    hiddenDefaults: [string, string][],
    customCategories: CustomCategory[]
  ) => {
    // Combine all visible categories (default + custom)
    const allCategories: Array<{ 
      id: string; 
      name: string; 
      isDefault: boolean; 
      key?: string;
    }> = [
      ...visibleDefaults.map(([key, label]) => ({ 
        id: key, 
        name: label, 
        isDefault: true, 
        key 
      })),
      ...customCategories.map(cat => ({ 
        id: cat.id, 
        name: cat.name, 
        isDefault: false 
      }))
    ].sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className="space-y-4">
        {/* Add button */}
        <div className="flex justify-end">
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

        {/* All Categories (unified list) */}
        {allCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma categoria de {type === 'receita' ? 'receita' : 'despesa'}
          </p>
        ) : (
          <div className="grid gap-2">
            {allCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg"
              >
                <span className="text-sm">{category.name}</span>
                <div className="flex gap-1">
                  {category.isDefault ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => openHideDefaultDialog(category.key!, category.name, type)}
                      title="Ocultar categoria"
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEditDialog({ id: category.id, name: category.name, type, icon: 'tag', created_at: '' })}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog({ id: category.id, name: category.name, type, icon: 'tag', created_at: '' })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden Default Categories (Collapsible) */}
        {hiddenDefaults.length > 0 && (
          <Collapsible open={isHiddenOpen} onOpenChange={setIsHiddenOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                <RotateCcw className="w-4 h-4 mr-2" />
                {hiddenDefaults.length} categoria{hiddenDefaults.length > 1 ? 's' : ''} oculta{hiddenDefaults.length > 1 ? 's' : ''}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {hiddenDefaults.map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg opacity-60"
                >
                  <span className="text-sm line-through">{label}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => handleRestoreDefault(key, type)}
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restaurar
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Gerenciar Categorias
          </CardTitle>
          <CardDescription>
            Adicione, edite ou oculte categorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'receita' | 'despesa')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="receita">Receitas</TabsTrigger>
              <TabsTrigger value="despesa">Despesas</TabsTrigger>
            </TabsList>

            <TabsContent value="receita">
              {renderCategoryList('receita', visibleIncomeDefaults, hiddenIncomeDefaults, customIncomeCategories)}
            </TabsContent>

            <TabsContent value="despesa">
              {renderCategoryList('despesa', visibleExpenseDefaults, hiddenExpenseDefaults, customExpenseCategories)}
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

      {/* Delete Custom Category Confirmation */}
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

      {/* Hide Default Category Confirmation */}
      <AlertDialog open={isHideDefaultDialogOpen} onOpenChange={setIsHideDefaultDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ocultar Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja ocultar a categoria "{hidingDefault?.label}"? 
              Você pode restaurá-la depois na seção de categorias ocultas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHideDefault}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ocultar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
