-- Functions that accept date range parameters for admin metrics

-- Get transactions count in date range
CREATE OR REPLACE FUNCTION public.admin_get_transactions_in_range(start_date text, end_date text)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.transactions 
  WHERE date >= start_date AND date <= end_date
$$;

-- Get volume in date range
CREATE OR REPLACE FUNCTION public.admin_get_volume_in_range(start_date text, end_date text)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(value), 0) FROM public.transactions 
  WHERE date >= start_date AND date <= end_date
$$;

-- Get active users in date range (based on last_sign_in_at)
CREATE OR REPLACE FUNCTION public.admin_get_active_users_in_range(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles 
  WHERE last_sign_in_at >= start_date 
  AND last_sign_in_at <= end_date
  AND NOT is_blocked
$$;

-- Get audit events in date range
CREATE OR REPLACE FUNCTION public.admin_get_audit_events_in_range(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.audit_log 
  WHERE created_at >= start_date AND created_at <= end_date
$$;

-- Get transactions by day in date range
CREATE OR REPLACE FUNCTION public.admin_get_transactions_by_day_in_range(start_date text, end_date text)
RETURNS TABLE(date text, count bigint, volume numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.date,
    COUNT(*) as count,
    SUM(t.value) as volume
  FROM public.transactions t
  WHERE t.date >= start_date AND t.date <= end_date
  GROUP BY t.date
  ORDER BY t.date DESC
$$;

-- Get financial stats in date range
CREATE OR REPLACE FUNCTION public.admin_get_financial_stats_in_range(start_date text, end_date text)
RETURNS TABLE(
  total_transactions bigint, 
  total_income numeric,
  total_expense numeric,
  active_users_with_transactions bigint,
  avg_transaction_value numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) as total_transactions,
    COALESCE(SUM(CASE WHEN type = 'receita' THEN value ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'despesa' THEN value ELSE 0 END), 0) as total_expense,
    COUNT(DISTINCT user_id) as active_users_with_transactions,
    ROUND(COALESCE(AVG(value), 0), 2) as avg_transaction_value
  FROM public.transactions
  WHERE date >= start_date AND date <= end_date
$$;