-- Function to delete user account (removes all user data and the auth user)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user data from all tables (cascading will handle most)
  DELETE FROM public.transactions WHERE user_id = current_user_id;
  DELETE FROM public.debts WHERE user_id = current_user_id;
  DELETE FROM public.investment_goals WHERE user_id = current_user_id;
  DELETE FROM public.custom_categories WHERE user_id = current_user_id;
  DELETE FROM public.category_order WHERE user_id = current_user_id;
  DELETE FROM public.hidden_default_categories WHERE user_id = current_user_id;
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- Delete the auth user (this will cascade and remove the user from auth.users)
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RETURN true;
END;
$$;