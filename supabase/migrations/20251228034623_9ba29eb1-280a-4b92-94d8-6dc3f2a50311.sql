-- ============================================
-- VALIDAÇÃO SERVER-SIDE DE VALORES FINANCEIROS
-- ============================================

-- Função de validação para transações
CREATE OR REPLACE FUNCTION public.validate_transaction_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que o valor é positivo e dentro dos limites
  IF NEW.value IS NULL OR NEW.value <= 0 THEN
    RAISE EXCEPTION 'O valor da transação deve ser maior que zero';
  END IF;
  
  IF NEW.value > 999999999.99 THEN
    RAISE EXCEPTION 'O valor máximo permitido é R$ 999.999.999,99';
  END IF;
  
  -- Validar tipo
  IF NEW.type NOT IN ('receita', 'despesa') THEN
    RAISE EXCEPTION 'Tipo de transação inválido. Use "receita" ou "despesa"';
  END IF;
  
  -- Validar que categoria não está vazia
  IF NEW.category IS NULL OR TRIM(NEW.category) = '' THEN
    RAISE EXCEPTION 'A categoria é obrigatória';
  END IF;
  
  -- Validar que descrição não está vazia
  IF NEW.description IS NULL OR TRIM(NEW.description) = '' THEN
    RAISE EXCEPTION 'A descrição é obrigatória';
  END IF;
  
  -- Validar tamanho da descrição
  IF LENGTH(NEW.description) > 200 THEN
    RAISE EXCEPTION 'A descrição deve ter no máximo 200 caracteres';
  END IF;
  
  -- Validar formato da data (YYYY-MM-DD)
  IF NEW.date !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RAISE EXCEPTION 'Formato de data inválido. Use YYYY-MM-DD';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para transações
DROP TRIGGER IF EXISTS validate_transaction_before_insert_update ON public.transactions;
CREATE TRIGGER validate_transaction_before_insert_update
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_transaction_values();

-- Função de validação para dívidas
CREATE OR REPLACE FUNCTION public.validate_debt_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar valor total
  IF NEW.total_value IS NULL OR NEW.total_value <= 0 THEN
    RAISE EXCEPTION 'O valor total da dívida deve ser maior que zero';
  END IF;
  
  IF NEW.total_value > 999999999.99 THEN
    RAISE EXCEPTION 'O valor máximo permitido é R$ 999.999.999,99';
  END IF;
  
  -- Validar parcela mensal
  IF NEW.monthly_installment IS NULL OR NEW.monthly_installment <= 0 THEN
    RAISE EXCEPTION 'A parcela mensal deve ser maior que zero';
  END IF;
  
  IF NEW.monthly_installment > NEW.total_value THEN
    RAISE EXCEPTION 'A parcela mensal não pode ser maior que o valor total';
  END IF;
  
  -- Validar valor pago
  IF NEW.paid_value IS NULL THEN
    NEW.paid_value := 0;
  END IF;
  
  IF NEW.paid_value < 0 THEN
    RAISE EXCEPTION 'O valor pago não pode ser negativo';
  END IF;
  
  IF NEW.paid_value > NEW.total_value THEN
    RAISE EXCEPTION 'O valor pago não pode ser maior que o valor total';
  END IF;
  
  -- Validar nome
  IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
    RAISE EXCEPTION 'O nome da dívida é obrigatório';
  END IF;
  
  IF LENGTH(NEW.name) > 100 THEN
    RAISE EXCEPTION 'O nome deve ter no máximo 100 caracteres';
  END IF;
  
  -- Validar formato da data
  IF NEW.start_date !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RAISE EXCEPTION 'Formato de data inválido. Use YYYY-MM-DD';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para dívidas
DROP TRIGGER IF EXISTS validate_debt_before_insert_update ON public.debts;
CREATE TRIGGER validate_debt_before_insert_update
  BEFORE INSERT OR UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_debt_values();

-- Função de validação para metas de investimento
CREATE OR REPLACE FUNCTION public.validate_investment_goal_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar valor alvo
  IF NEW.target_value IS NULL OR NEW.target_value <= 0 THEN
    RAISE EXCEPTION 'O valor da meta deve ser maior que zero';
  END IF;
  
  IF NEW.target_value > 999999999.99 THEN
    RAISE EXCEPTION 'O valor máximo permitido é R$ 999.999.999,99';
  END IF;
  
  -- Validar tipo
  IF NEW.type IS NULL OR TRIM(NEW.type) = '' THEN
    RAISE EXCEPTION 'O tipo de investimento é obrigatório';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para metas de investimento
DROP TRIGGER IF EXISTS validate_investment_goal_before_insert_update ON public.investment_goals;
CREATE TRIGGER validate_investment_goal_before_insert_update
  BEFORE INSERT OR UPDATE ON public.investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_investment_goal_values();