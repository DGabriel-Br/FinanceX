import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CustomCategory {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  icon: string;
  created_at: string;
}

export function useCustomCategories() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCategories((data || []) as CustomCategory[]);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name: string, type: 'receita' | 'despesa', icon: string = 'tag') => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar categorias.',
        variant: 'destructive',
      });
      return false;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: 'Nome inválido',
        description: 'O nome da categoria não pode ser vazio.',
        variant: 'destructive',
      });
      return false;
    }

    if (trimmedName.length > 50) {
      toast({
        title: 'Nome muito longo',
        description: 'O nome da categoria deve ter no máximo 50 caracteres.',
        variant: 'destructive',
      });
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
          toast({
            title: 'Categoria já existe',
            description: `Já existe uma categoria "${trimmedName}" para ${type === 'receita' ? 'receitas' : 'despesas'}.`,
            variant: 'destructive',
          });
          return false;
        }
        throw error;
      }

      setCategories(prev => [...prev, data as CustomCategory].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Categoria criada',
        description: `A categoria "${trimmedName}" foi criada com sucesso.`,
      });
      return true;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: 'Erro ao criar categoria',
        description: error.message || 'Ocorreu um erro ao criar a categoria.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateCategory = async (id: string, name: string, icon?: string) => {
    if (!user) return false;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: 'Nome inválido',
        description: 'O nome da categoria não pode ser vazio.',
        variant: 'destructive',
      });
      return false;
    }

    if (trimmedName.length > 50) {
      toast({
        title: 'Nome muito longo',
        description: 'O nome da categoria deve ter no máximo 50 caracteres.',
        variant: 'destructive',
      });
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
          toast({
            title: 'Categoria já existe',
            description: 'Já existe uma categoria com este nome.',
            variant: 'destructive',
          });
          return false;
        }
        throw error;
      }

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, name: trimmedName, icon: icon || cat.icon } : cat)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({
        title: 'Categoria atualizada',
        description: `A categoria foi atualizada com sucesso.`,
      });
      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message || 'Ocorreu um erro ao atualizar a categoria.',
        variant: 'destructive',
      });
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
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso.',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Erro ao excluir categoria',
        description: error.message || 'Ocorreu um erro ao excluir a categoria.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getCategoriesByType = (type: 'receita' | 'despesa') => {
    return categories.filter(cat => cat.type === type);
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    refetch: fetchCategories,
  };
}
