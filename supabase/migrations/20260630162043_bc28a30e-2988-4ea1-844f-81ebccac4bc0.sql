
-- usage_logs: writes only via service_role
REVOKE INSERT, UPDATE, DELETE ON public.usage_logs FROM authenticated, anon;
GRANT ALL ON public.usage_logs TO service_role;

-- training_dataset: writes only via service_role (admin policy remains for reads/management via service role)
REVOKE INSERT, UPDATE, DELETE ON public.training_dataset FROM authenticated, anon;
GRANT ALL ON public.training_dataset TO service_role;
