
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.subscription IS DISTINCT FROM OLD.subscription THEN
    RAISE EXCEPTION 'subscription can only be changed by an administrator';
  END IF;
  IF NEW.daily_limit IS DISTINCT FROM OLD.daily_limit THEN
    RAISE EXCEPTION 'daily_limit can only be changed by an administrator';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

DROP POLICY IF EXISTS "Users update own usage" ON public.usage_logs;
DROP POLICY IF EXISTS "Users insert own usage" ON public.usage_logs;

REVOKE INSERT, UPDATE, DELETE ON public.usage_logs FROM authenticated;
GRANT ALL ON public.usage_logs TO service_role;
