-- ⚠️ WARNING: This will DELETE ALL DATA in these tables!
-- Only run this if you want to completely reset the database

-- Drop all policies first
DROP POLICY IF EXISTS "Group members can view each other" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

DROP POLICY IF EXISTS "Creators can update their groups" ON public.ride_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.ride_groups;
DROP POLICY IF EXISTS "Group members can view their group" ON public.ride_groups;
DROP POLICY IF EXISTS "Authenticated users can view open groups" ON public.ride_groups;

DROP POLICY IF EXISTS "Users can remove themselves" ON public.group_members;
DROP POLICY IF EXISTS "Creators can update member status" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Creators can view all members" ON public.group_members;
DROP POLICY IF EXISTS "Group members can view other members" ON public.group_members;

DROP POLICY IF EXISTS "Users can update own requests" ON public.ride_requests;
DROP POLICY IF EXISTS "Users can create own requests" ON public.ride_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.ride_requests;

-- Drop triggers
DROP TRIGGER IF EXISTS validate_pitt_email_trigger ON public.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.validate_pitt_email();

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.ride_requests CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.ride_groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Confirm reset
SELECT 'Database reset complete. All tables dropped.' AS status;
