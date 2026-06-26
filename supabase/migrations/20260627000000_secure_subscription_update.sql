-- Trigger function to secure subscription status from manual client-side modification
CREATE OR REPLACE FUNCTION public.check_profile_update_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if subscription-related fields are being altered
  IF (OLD.subscription_type IS DISTINCT FROM NEW.subscription_type OR
      OLD.subscription_start_date IS DISTINCT FROM NEW.subscription_start_date OR
      OLD.subscription_end_date IS DISTINCT FROM NEW.subscription_end_date) THEN
    
    -- standard authenticated users are not permitted to upgrade/modify their own subscription fields
    IF auth.role() = 'authenticated' THEN
      RAISE EXCEPTION 'You are not authorized to modify subscription status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enforce the trigger check before any update on the profiles table
DROP TRIGGER IF EXISTS enforce_profile_subscription_lock ON public.profiles;
CREATE TRIGGER enforce_profile_subscription_lock
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_update_permissions();
