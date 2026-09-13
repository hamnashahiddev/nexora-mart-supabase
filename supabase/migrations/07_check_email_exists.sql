-- 07_check_email_exists.sql

-- Create a secure RPC function to check if an email exists in the auth.users table
-- We use SECURITY DEFINER so it executes with the privileges of the creator (postgres)
-- This allows the anon user to check existence without having direct access to auth.users

CREATE OR REPLACE FUNCTION public.check_email_exists(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists BOOLEAN;
BEGIN
  -- Check if the email exists in the auth.users table securely
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = check_email
  ) INTO exists;
  
  RETURN exists;
END;
$$;

-- Grant access to the public anon role so the frontend can call it
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO authenticated;
