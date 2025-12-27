import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { db, generateTempId, isTempId, LocalCustomCategory, LocalHiddenCategory, LocalCategoryOrder } from '@/lib/offline/database';
import { syncService } from '@/lib/offline/syncService';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { logger } from '@/lib/logger';

export interface CustomCategory {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  icon: string;
}

export interface CategoryOrder {
  categoryKey: string;
  type: 'receita' | 'despesa';
  position: number;
}

export function useOfflineCategories() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Observar categorias customizadas do IndexedDB
  const localCategories = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.customCategories
        .where('userId')
        .equals(userId)
        .filter(c => !c.isDeleted)
        .toArray();
    },
    [userId],
    []
  );

  // Observar categorias ocultas do IndexedDB
  const localHiddenCategories = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.hiddenCategories
        .where('userId')
        .equals(userId)
        .filter(h => !h.isDeleted)
        .toArray();
    },
    [userId],
    []
  );

  // Observar ordem das categorias do IndexedDB
  const localCategoryOrder = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.categoryOrder
        .where('userId')
        .equals(userId)
        .toArray();
    },
    [userId],
    []
  );

  // Converter para formatos de saída
  const categories: CustomCategory[] = (localCategories || []).map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
  }));

  const hiddenDefaults = (localHiddenCategories || []).map(h => ({
    id: h.id,
    category_key: h.categoryKey,
    type: h.type,
  }));

  const categoryOrder: CategoryOrder[] = (localCategoryOrder || []).map(o => ({
    categoryKey: o.categoryKey,
    type: o.type,
    position: o.position,
  }));

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Se online, sincronizar categorias
          if (navigator.onLine) {
            await syncCategories(user.id);
          }
        }
      } catch (error) {
        logger.error('Erro ao inicializar categorias:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Sincronizar categorias do servidor para local
  const syncCategories = async (uid: string) => {
    try {
      // Buscar categorias do servidor
      const [categoriesRes, hiddenRes, orderRes] = await Promise.all([
        supabase.from('custom_categories').select('*').eq('user_id', uid),
        supabase.from('hidden_default_categories').select('*').eq('user_id', uid),
        supabase.from('category_order').select('*').eq('user_id', uid),
      ]);

      const now = Date.now();

      // Sincronizar categorias customizadas
      if (categoriesRes.data) {
        for (const cat of categoriesRes.data) {
          const local = await db.customCategories.get(cat.id);
          if (!local || local.syncStatus === 'synced') {
            await db.customCategories.put({
              id: cat.id,
              name: cat.name,
              type: cat.type as 'receita' | 'despesa',
              icon: cat.icon || 'tag',
              createdAt: new Date(cat.created_at).getTime(),
              userId: uid,
              syncStatus: 'synced',
              localUpdatedAt: now,
              serverUpdatedAt: now,
              version: 1,
            });
          }
        }
      }

      // Sincronizar categorias ocultas
      if (hiddenRes.data) {
        for (const hidden of hiddenRes.data) {
          const local = await db.hiddenCategories.get(hidden.id);
          if (!local || local.syncStatus === 'synced') {
            await db.hiddenCategories.put({
              id: hidden.id,
              categoryKey: hidden.category_key,
              type: hidden.type as 'receita' | 'despesa',
              createdAt: new Date(hidden.created_at).getTime(),
              userId: uid,
              syncStatus: 'synced',
              localUpdatedAt: now,
              serverUpdatedAt: now,
              version: 1,
            });
          }
        }
      }

      // Sincronizar ordem das categorias
      if (orderRes.data) {
        for (const order of orderRes.data) {
          const local = await db.categoryOrder.get(order.id);
          if (!local || local.syncStatus === 'synced') {
            await db.categoryOrder.put({
              id: order.id,
              categoryKey: order.category_key,
              type: order.type as 'receita' | 'despesa',
              position: order.position,
              userId: uid,
              syncStatus: 'synced',
              localUpdatedAt: now,
              serverUpdatedAt: now,
              version: 1,
            });
          }
        }
      }
    } catch (error) {
      logger.error('Erro ao sincronizar categorias:', error);
    }
  };

  // Adicionar categoria
  const addCategory = useCallback(async (name: string, type: 'receita' | 'despesa', icon: string = 'tag') => {
    if (!userId) {
      toast.error('Usuário não autenticado');
      return false;
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 50) {
      toast.error(trimmedName ? 'Nome muito longo (max 50 caracteres)' : 'Nome não pode ser vazio');
      return false;
    }

    try {
      const now = Date.now();
      const tempId = generateTempId();

      const localCategory: LocalCustomCategory = {
        id: tempId,
        name: trimmedName,
        type,
        icon,
        createdAt: now,
        userId,
        syncStatus: 'pending',
        localUpdatedAt: now,
        version: 1,
      };

      await db.customCategories.add(localCategory);

      // Se online, sincronizar imediatamente
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('custom_categories')
          .insert({ user_id: userId, name: trimmedName, type, icon })
          .select()
          .single();

        if (!error && data) {
          await db.customCategories.delete(tempId);
          await db.customCategories.add({
            ...localCategory,
            id: data.id,
            createdAt: new Date(data.created_at).getTime(),
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        }
      }

      toast.success(navigator.onLine ? 'Categoria criada!' : 'Categoria salva localmente');
      return true;
    } catch (error: any) {
      logger.error('Erro ao criar categoria:', error);
      toast.error(error.message || 'Erro ao criar categoria');
      return false;
    }
  }, [userId]);

  // Atualizar categoria
  const updateCategory = useCallback(async (id: string, name: string, icon?: string) => {
    if (!userId) return false;

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 50) {
      toast.error(trimmedName ? 'Nome muito longo' : 'Nome não pode ser vazio');
      return false;
    }

    try {
      const now = Date.now();
      const existing = await db.customCategories.get(id);
      if (!existing) return false;

      await db.customCategories.update(id, {
        name: trimmedName,
        icon: icon || existing.icon,
        syncStatus: 'pending',
        localUpdatedAt: now,
        version: (existing.version || 0) + 1,
      });

      if (navigator.onLine && !isTempId(id)) {
        const { error } = await supabase
          .from('custom_categories')
          .update({ name: trimmedName, icon: icon || existing.icon })
          .eq('id', id);

        if (!error) {
          await db.customCategories.update(id, {
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        }
      }

      toast.success(navigator.onLine ? 'Categoria atualizada!' : 'Alteração salva localmente');
      return true;
    } catch (error: any) {
      logger.error('Erro ao atualizar categoria:', error);
      toast.error(error.message || 'Erro ao atualizar categoria');
      return false;
    }
  }, [userId]);

  // Excluir categoria
  const deleteCategory = useCallback(async (id: string) => {
    if (!userId) return false;

    try {
      const now = Date.now();

      await db.customCategories.update(id, {
        isDeleted: true,
        syncStatus: 'pending',
        localUpdatedAt: now,
      });

      if (navigator.onLine && !isTempId(id)) {
        const { error } = await supabase
          .from('custom_categories')
          .delete()
          .eq('id', id);

        if (!error) {
          await db.customCategories.delete(id);
        }
      }

      toast.success(navigator.onLine ? 'Categoria excluída!' : 'Exclusão salva localmente');
      return true;
    } catch (error: any) {
      logger.error('Erro ao excluir categoria:', error);
      toast.error(error.message || 'Erro ao excluir categoria');
      return false;
    }
  }, [userId]);

  // Ocultar categoria padrão
  const hideDefaultCategory = useCallback(async (categoryKey: string, type: 'receita' | 'despesa') => {
    if (!userId) return false;

    try {
      const now = Date.now();
      const tempId = generateTempId();

      const localHidden: LocalHiddenCategory = {
        id: tempId,
        categoryKey,
        type,
        createdAt: now,
        userId,
        syncStatus: 'pending',
        localUpdatedAt: now,
        version: 1,
      };

      await db.hiddenCategories.add(localHidden);

      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('hidden_default_categories')
          .insert({ user_id: userId, category_key: categoryKey, type })
          .select()
          .single();

        if (!error && data) {
          await db.hiddenCategories.delete(tempId);
          await db.hiddenCategories.add({
            ...localHidden,
            id: data.id,
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        }
      }

      toast.success('Categoria oculta');
      return true;
    } catch (error: any) {
      logger.error('Erro ao ocultar categoria:', error);
      return false;
    }
  }, [userId]);

  // Restaurar categoria padrão
  const restoreDefaultCategory = useCallback(async (categoryKey: string, type: 'receita' | 'despesa') => {
    if (!userId) return false;

    try {
      const existing = await db.hiddenCategories
        .where('userId')
        .equals(userId)
        .filter(h => h.categoryKey === categoryKey && h.type === type && !h.isDeleted)
        .first();

      if (!existing) return false;

      await db.hiddenCategories.update(existing.id, {
        isDeleted: true,
        syncStatus: 'pending',
        localUpdatedAt: Date.now(),
      });

      if (navigator.onLine && !isTempId(existing.id)) {
        await supabase
          .from('hidden_default_categories')
          .delete()
          .eq('id', existing.id);
        
        await db.hiddenCategories.delete(existing.id);
      }

      toast.success('Categoria restaurada');
      return true;
    } catch (error: any) {
      logger.error('Erro ao restaurar categoria:', error);
      return false;
    }
  }, [userId]);

  // Utilitários
  const getCategoriesByType = useCallback((type: 'receita' | 'despesa') => {
    return categories.filter(c => c.type === type);
  }, [categories]);

  const isDefaultHidden = useCallback((categoryKey: string, type: 'receita' | 'despesa') => {
    return hiddenDefaults.some(h => h.category_key === categoryKey && h.type === type);
  }, [hiddenDefaults]);

  const getCategoryPosition = useCallback((categoryKey: string, type: 'receita' | 'despesa') => {
    const order = categoryOrder.find(o => o.categoryKey === categoryKey && o.type === type);
    return order?.position ?? Infinity;
  }, [categoryOrder]);

  const getVisibleDefaultCategories = useCallback((type: 'receita' | 'despesa', allDefaults: [string, string][]) => {
    return allDefaults.filter(([key]) => !isDefaultHidden(key, type));
  }, [isDefaultHidden]);

  const getHiddenDefaultCategories = useCallback((type: 'receita' | 'despesa', allDefaults: [string, string][]) => {
    return allDefaults.filter(([key]) => isDefaultHidden(key, type));
  }, [isDefaultHidden]);

  const getSortedCategories = useCallback((
    type: 'receita' | 'despesa',
    visibleDefaults: [string, string][],
    customCats: CustomCategory[]
  ) => {
    const allCategories = [
      ...visibleDefaults.map(([key, label]) => ({ 
        id: key, name: label, isDefault: true, key 
      })),
      ...customCats.map(cat => ({ 
        id: cat.id, name: cat.name, isDefault: false, key: `custom_${cat.id}` 
      }))
    ];

    return allCategories.sort((a, b) => {
      const posA = getCategoryPosition(a.key, type);
      const posB = getCategoryPosition(b.key, type);
      if (posA === Infinity && posB === Infinity) return a.name.localeCompare(b.name);
      return posA - posB;
    });
  }, [getCategoryPosition]);

  const refetch = useCallback(async () => {
    if (userId && navigator.onLine) {
      await syncCategories(userId);
    }
  }, [userId]);

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
    getSortedCategories,
    refetch,
  };
}
