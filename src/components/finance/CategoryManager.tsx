import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Tag, Loader2, GripVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCustomCategories, CustomCategory } from '@/hooks/useCustomCategories';
import { incomeCategoryLabels, expenseCategoryLabels } from '@/types/transaction';

interface SortableCategoryItem {
  id: string;
  name: string;
  isDefault: boolean;
  key: string;
}

function SortableCategoryRow({
  category,
  type,
  onEdit,
  onDelete,
}: {
  category: SortableCategoryItem;
  type: 'receita' | 'despesa';
  onEdit: (category: { id: string; name: string; type: 'receita' | 'despesa'; isDefault: boolean }) => void;
  onDelete: (category: { id: string; name: string; type: 'receita' | 'despesa'; isDefault: boolean }) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center justify-between px-4 py-3 
        bg-gradient-to-r from-card to-card/80 
        border border-border/50 rounded-xl
        hover:border-primary/30 hover:shadow-md hover:shadow-primary/5
        transition-all duration-200
        ${isDragging ? 'shadow-lg shadow-primary/20 border-primary/50' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{category.name}</span>
          {category.isDefault && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
              padrão
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
          onClick={() => onEdit({ id: category.id, name: category.name, type, isDefault: category.isDefault })}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete({ id: category.id, name: category.name, type, isDefault: category.isDefault })}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function CategoryManager() {
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
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; type: 'receita' | 'despesa'; isDefault: boolean; newName: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string; type: 'receita' | 'despesa'; isDefault: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    if (!editingCategory || !editingCategory.newName.trim()) return;
    
    setIsSubmitting(true);
    
    if (editingCategory.isDefault) {
      // For default categories, we "hide" the old one and create a new custom one
      await hideDefaultCategory(editingCategory.id, editingCategory.type);
      await addCategory(editingCategory.newName.trim(), editingCategory.type);
    } else {
      await updateCategory(editingCategory.id, editingCategory.newName);
    }
    
    setIsSubmitting(false);
    setEditingCategory(null);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    setIsSubmitting(true);
    
    if (deletingCategory.isDefault) {
      await hideDefaultCategory(deletingCategory.id, deletingCategory.type);
    } else {
      await deleteCategory(deletingCategory.id);
    }
    
    setIsSubmitting(false);
    setDeletingCategory(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (category: { id: string; name: string; type: 'receita' | 'despesa'; isDefault: boolean }) => {
    setEditingCategory({ ...category, newName: category.name });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: { id: string; name: string; type: 'receita' | 'despesa'; isDefault: boolean }) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const defaultIncomeCategories = Object.entries(incomeCategoryLabels) as [string, string][];
  const defaultExpenseCategories = Object.entries(expenseCategoryLabels) as [string, string][];
  
  const visibleIncomeDefaults = getVisibleDefaultCategories('receita', defaultIncomeCategories);
  const visibleExpenseDefaults = getVisibleDefaultCategories('despesa', defaultExpenseCategories);
  
  const customIncomeCategories = getCategoriesByType('receita');
  const customExpenseCategories = getCategoriesByType('despesa');

  // Memoized sorted categories
  const sortedIncomeCategories = useMemo(
    () => getSortedCategories('receita', visibleIncomeDefaults, customIncomeCategories),
    [getSortedCategories, visibleIncomeDefaults, customIncomeCategories]
  );

  const sortedExpenseCategories = useMemo(
    () => getSortedCategories('despesa', visibleExpenseDefaults, customExpenseCategories),
    [getSortedCategories, visibleExpenseDefaults, customExpenseCategories]
  );

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Carregando categorias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDragEnd = async (event: DragEndEvent, type: 'receita' | 'despesa', categories: SortableCategoryItem[]) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);
    
    const newOrder = arrayMove(categories, oldIndex, newIndex);
    const orderedKeys = newOrder.map((cat) => cat.key);
    
    await updateCategoryOrder(orderedKeys, type);
  };

  const renderCategoryList = (
    type: 'receita' | 'despesa',
    sortedCategories: SortableCategoryItem[]
  ) => (
    <div className="space-y-4 pt-4">
      {/* Header with count and add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {sortedCategories.length} {sortedCategories.length === 1 ? 'categoria' : 'categorias'}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setNewCategoryName('');
            setIsAddDialogOpen(true);
          }}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories list with drag and drop */}
      {sortedCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Nenhuma categoria de {type === 'receita' ? 'receita' : 'despesa'}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Clique em "Nova Categoria" para começar
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, type, sortedCategories)}
        >
          <SortableContext
            items={sortedCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedCategories.map((category) => (
                <SortableCategoryRow
                  key={category.id}
                  category={category}
                  type={type}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Tip */}
      {sortedCategories.length > 1 && (
        <p className="text-xs text-muted-foreground/60 text-center pt-2">
          💡 Arraste para reordenar as categorias
        </p>
      )}
    </div>
  );

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Tag className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">Gerenciar Categorias</CardTitle>
              <CardDescription className="text-sm">
                Organize suas categorias de receitas e despesas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'receita' | 'despesa')}>
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
              <TabsTrigger 
                value="receita" 
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg transition-all"
              >
                Receitas
              </TabsTrigger>
              <TabsTrigger 
                value="despesa"
                className="data-[state=active]:bg-rose-500 data-[state=active]:text-white rounded-lg transition-all"
              >
                Despesas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receita">
              {renderCategoryList('receita', sortedIncomeCategories)}
            </TabsContent>

            <TabsContent value="despesa">
              {renderCategoryList('despesa', sortedExpenseCategories)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nova Categoria
            </DialogTitle>
            <DialogDescription>
              Adicione uma categoria de {activeTab === 'receita' ? 'receita' : 'despesa'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Freelance, Alimentação..."
                maxLength={50}
                className="h-11"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    handleAdd();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting || !newCategoryName.trim()}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Editar Categoria
            </DialogTitle>
            <DialogDescription>
              Altere o nome da categoria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">Nome da Categoria</Label>
              <Input
                id="editCategoryName"
                value={editingCategory?.newName || ''}
                onChange={(e) => setEditingCategory(prev => prev ? { ...prev, newName: e.target.value } : null)}
                placeholder="Nome da categoria"
                maxLength={50}
                className="h-11"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editingCategory?.newName.trim()) {
                    handleEdit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting || !editingCategory?.newName.trim()}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Excluir Categoria
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deletingCategory?.name}"? 
              {deletingCategory?.isDefault ? (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  Esta é uma categoria padrão. Ela será removida da sua lista.
                </span>
              ) : (
                <span className="block mt-2">Esta ação não pode ser desfeita.</span>
              )}
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