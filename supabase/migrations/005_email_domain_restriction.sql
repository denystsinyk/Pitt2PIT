-- Function to validate @pitt.edu email domain
CREATE OR REPLACE FUNCTION public.validate_pitt_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email NOT LIKE '%@pitt.edu' THEN
        RAISE EXCEPTION 'Only @pitt.edu email addresses are allowed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate email domain on user creation
CREATE TRIGGER validate_pitt_email_trigger
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_pitt_email();

-- Note: You should also configure Supabase Auth to restrict email domains
-- This can be done in the Supabase Dashboard under Authentication > Settings
-- Or by using the Supabase Management API to set allowed email domains
