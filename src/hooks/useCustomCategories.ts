import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface CustomCategory {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  icon: string;
  created_at: string;
}

export interface HiddenDefaultCategory {
  id: string;
  category_key: string;
  type: 'receita' | 'despesa';
}

export interface CategoryOrder {
  id: string;
  category_key: string;
  type: 'receita' | 'despesa';
  position: number;
}

export function useCustomCategories() {
  const { user } = useAuthContext();
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<HiddenDefaultCategory[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<CategoryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setHiddenDefaults([]);
      setCategoryOrder([]);
      setLoading(false);
      return;
    }

    try {
      const [categoriesResult, hiddenResult, orderResult] = await Promise.all([
        supabase
          .from('custom_categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name'),
        supabase
          .from('hidden_default_categories')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('category_order')
          .select('*')
          .eq('user_id', user.id)
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (hiddenResult.error) throw hiddenResult.error;
      if (orderResult.error) throw orderResult.error;
      
      setCategories((categoriesResult.data || []) as CustomCategory[]);
      setHiddenDefaults((hiddenResult.data || []) as HiddenDefaultCategory[]);
      setCategoryOrder((orderResult.data || []) as CategoryOrder[]);
    } catch (error) {
      logger.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name: string, type: 'receita' | 'despesa', icon: string = 'tag') => {
    if (!user) {
      toast.error('Você precisa estar logado para criar categorias.');
      return false;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('O nome da categoria não pode ser vazio.');
      return false;
    }

    if (trimmedName.length > 50) {
      toast.error('O nome da categoria deve ter no máximo 50 caracteres.');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert({
          user_id: user.id,
          name: trimmedName,
          type,
          icon,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error(`Já existe uma categoria "${trimmedName}" para ${type === 'receita' ? 'receitas' : 'despesas'}.`);
          return false;
        }
        throw error;
      }

      setCategories(prev => [...prev, data as CustomCategory].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Categoria "${trimmedName}" criada com sucesso.`);
      return true;
    } catch (error: any) {
      logger.error('Error creating category:', error);
      toast.error(error?.message || 'Ocorreu um erro ao criar a categoria.');
      return false;
    }
  };

  const updateCategory = async (id: string, name: string, icon?: string) => {
    if (!user) return false;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('O nome da categoria não pode ser vazio.');
      return false;
    }

    if (trimmedName.length > 50) {
      toast.error('O nome da categoria deve ter no máximo 50 caracteres.');
      return false;
    }

    try {
      const updateData: { name: string; icon?: string } = { name: trimmedName };
      if (icon) updateData.icon = icon;

      const { error } = await supabase
        .from('custom_categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe uma categoria com este nome.');
          return false;
        }
        throw error;
      }

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, name: trimmedName, icon: icon || cat.icon } : cat)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success('Categoria atualizada com sucesso.');
      return true;
    } catch (error: any) {
      logger.error('Error updating category:', error);
      toast.error(error?.message || 'Ocorreu um erro ao atualizar a categoria.');
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Categoria excluída com sucesso.');
      return true;
    } catch (error: any) {
      logger.error('Error deleting category:', error);
      toast.error(error?.message || 'Ocorreu um erro ao excluir a categoria.');
      return false;
    }
  };

  const getCategoriesByType = (type: 'receita' | 'despesa') => {
    return categories.filter(cat => cat.type === type);
  };

  const isDefaultHidden = (categoryKey: string, type: 'receita' | 'despesa') => {
    return hiddenDefaults.some(h => h.category_key === categoryKey && h.type === type);
  };

  const hideDefaultCategory = async (categoryKey: string, type: 'receita' | 'despesa') => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('hidden_default_categories')
        .insert({
          user_id: user.id,
          category_key: categoryKey,
          type,
        })
        .select()
        .single();

      if (error) throw error;

      setHiddenDefaults(prev => [...prev, data as HiddenDefaultCategory]);
      toast.success('Categoria padrão ocultada.');
      return true;
    } catch (error: any) {
      logger.error('Error hiding default category:', error);
      toast.error(error?.message || 'Ocorreu um erro.');
      return false;
    }
  };

  const restoreDefaultCategory = async (categoryKey: string, type: 'receita' | 'despesa') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('hidden_default_categories')
        .delete()
        .eq('user_id', user.id)
        .eq('category_key', categoryKey)
        .eq('type', type);

      if (error) throw error;

      setHiddenDefaults(prev => prev.filter(h => !(h.category_key === categoryKey && h.type === type)));
      toast.success('Categoria padrão restaurada.');
      return true;
    } catch (error: any) {
      logger.error('Error restoring default category:', error);
      toast.error(error?.message || 'Ocorreu um erro.');
      return false;
    }
  };

  const getVisibleDefaultCategories = (type: 'receita' | 'despesa', allDefaults: [string, string][]) => {
    return allDefaults.filter(([key]) => !isDefaultHidden(key, type));
  };

  const getHiddenDefaultCategories = (type: 'receita' | 'despesa', allDefaults: [string, string][]) => {
    return allDefaults.filter(([key]) => isDefaultHidden(key, type));
  };

  const getCategoryPosition = (categoryKey: string, type: 'receita' | 'despesa') => {
    const order = categoryOrder.find(o => o.category_key === categoryKey && o.type === type);
    return order?.position ?? Infinity;
  };

  const updateCategoryOrder = async (orderedKeys: string[], type: 'receita' | 'despesa') => {
    if (!user) return false;

    try {
      // Delete existing order for this type
      await supabase
        .from('category_order')
        .delete()
        .eq('user_id', user.id)
        .eq('type', type);

      // Insert new order
      const newOrder = orderedKeys.map((key, index) => ({
        user_id: user.id,
        category_key: key,
        type,
        position: index,
      }));

      if (newOrder.length > 0) {
        const { error } = await supabase
          .from('category_order')
          .insert(newOrder);

        if (error) throw error;
      }

      // Update local state
      setCategoryOrder(prev => {
        const otherType = prev.filter(o => o.type !== type);
        const newTypeOrder = orderedKeys.map((key, index) => ({
          id: crypto.randomUUID(),
          category_key: key,
          type,
          position: index,
        }));
        return [...otherType, ...newTypeOrder];
      });

      return true;
    } catch (error: any) {
      logger.error('Error updating category order:', error);
      toast.error(error?.message || 'Ocorreu um erro ao salvar a ordem.');
      return false;
    }
  };

  const getSortedCategories = (
    type: 'receita' | 'despesa',
    visibleDefaults: [string, string][],
    customCats: CustomCategory[]
  ) => {
    const allCategories: Array<{ 
      id: string; 
      name: string; 
      isDefault: boolean; 
      key: string;
    }> = [
      ...visibleDefaults.map(([key, label]) => ({ 
        id: key, 
        name: label, 
        isDefault: true, 
        key 
      })),
      ...customCats.map(cat => ({ 
        id: cat.id, 
        name: cat.name, 
        isDefault: false,
        key: `custom_${cat.id}`
      }))
    ];

    // Sort by saved order, then alphabetically for new items
    return allCategories.sort((a, b) => {
      const posA = getCategoryPosition(a.key, type);
      const posB = getCategoryPosition(b.key, type);
      
      if (posA === Infinity && posB === Infinity) {
        return a.name.localeCompare(b.name);
      }
      return posA - posB;
    });
  };

  return {
    categories,
    hiddenDefaults,
    categoryOrder,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    isDefaultHidden,
    hideDefaultCategory,
    restoreDefaultCategory,
    getVisibleDefaultCategories,
    getHiddenDefaultCategories,
    getCategoryPosition,
    updateCategoryOrder,
    getSortedCategories,
    refetch: fetchCategories,
  };
}
