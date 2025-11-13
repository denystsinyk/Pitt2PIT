-- Cross-table RLS policies that depend on multiple tables existing
-- This migration should run AFTER migrations 001-005
-- These policies reference multiple tables, so they must come last

-- Policy: Group members can see each other's basic user info
-- Allows users in the same accepted group to view contact details
CREATE POLICY "Group members can view each other"
    ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm1
            INNER JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = auth.uid()
            AND gm2.user_id = public.users.id
            AND gm1.status = 'accepted'
            AND gm2.status = 'accepted'
        )
    );

-- Policy: Group members can view their own groups (beyond just open ones)
-- Allows viewing groups you're a member of even if they're full/departed
CREATE POLICY "Group members can view their group"
    ON public.ride_groups
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_id = ride_groups.id
            AND user_id = auth.uid()
        )
    );
