import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  encodeInvestmentDescription, 
  hasStructuredTag,
  decodeInvestmentDescription 
} from '@/core/finance/investmentMetadata';
import { db } from '@/infra/offline/database';
import { toast } from 'sonner';

interface MigrationResult {
  total: number;
  migrated: number;
  alreadyMigrated: number;
  errors: number;
}

export const useMigrateInvestments = () => {
  const { user } = useAuthContext();
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const migrateInvestments = useCallback(async (): Promise<MigrationResult> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setIsMigrating(true);
    setResult(null);

    const migrationResult: MigrationResult = {
      total: 0,
      migrated: 0,
      alreadyMigrated: 0,
      errors: 0,
    };

    try {
      // Buscar todas as transações de investimento do usuário
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('id, description, type')
        .eq('user_id', user.id)
        .eq('category', 'investimentos');

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        toast.info('Nenhuma transação de investimento encontrada.');
        return migrationResult;
      }

      migrationResult.total = transactions.length;

      // Processar cada transação
      for (const transaction of transactions) {
        try {
          // Verificar se já tem tag estruturada
          if (hasStructuredTag(transaction.description)) {
            migrationResult.alreadyMigrated++;
            continue;
          }

          // Decodificar para obter o tipo de investimento (via parsing legado)
          const metadata = decodeInvestmentDescription(transaction.description);
          
          // Verificar se é resgate baseado na descrição
          const isWithdrawal = transaction.type === 'receita';
          
          // Criar nova descrição com tag estruturada
          const newDescription = encodeInvestmentDescription(
            metadata.type,
            transaction.description,
            isWithdrawal
          );

          // Atualizar no Supabase
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ description: newDescription })
            .eq('id', transaction.id);

          if (updateError) {
            console.error('Erro ao migrar transação:', transaction.id, updateError);
            migrationResult.errors++;
            continue;
          }

          // Atualizar também no IndexedDB local
          const localTransaction = await db.transactions.get(transaction.id);
          if (localTransaction) {
            await db.transactions.update(transaction.id, {
              description: newDescription,
              localUpdatedAt: Date.now(),
            });
          }

          migrationResult.migrated++;
        } catch (err) {
          console.error('Erro ao processar transação:', transaction.id, err);
          migrationResult.errors++;
        }
      }

      setResult(migrationResult);

      if (migrationResult.migrated > 0) {
        toast.success(`${migrationResult.migrated} transações migradas com sucesso!`);
      } else if (migrationResult.alreadyMigrated === migrationResult.total) {
        toast.info('Todas as transações já estão no novo formato.');
      }

      return migrationResult;
    } catch (err) {
      console.error('Erro na migração:', err);
      toast.error('Erro ao migrar transações.');
      throw err;
    } finally {
      setIsMigrating(false);
    }
  }, [user?.id]);

  return {
    migrateInvestments,
    isMigrating,
    result,
  };
};
