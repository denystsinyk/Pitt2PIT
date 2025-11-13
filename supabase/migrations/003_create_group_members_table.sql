-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.ride_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create indexesv
CREATE INDEX group_members_group_idx ON public.group_members(group_id);
CREATE INDEX group_members_user_idx ON public.group_members(user_id);
CREATE INDEX group_members_status_idx ON public.group_members(status);

-- RLS Policies
-- Group members can view other members in their group
CREATE POLICY "Group members can view other members"
    ON public.group_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
        )
    );

-- Group creators can view all members (including pending)
CREATE POLICY "Creators can view all members"
    ON public.group_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ride_groups rg
            WHERE rg.id = group_members.group_id
            AND rg.creator_id = auth.uid()
        )
    );

-- Users can join groups (insert their own membership)
CREATE POLICY "Users can join groups"
    ON public.group_members
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Group creators can update member status (approve/decline)
CREATE POLICY "Creators can update member status"
    ON public.group_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.ride_groups rg
            WHERE rg.id = group_members.group_id
            AND rg.creator_id = auth.uid()
        )
    );

-- Users can remove themselves from groups
CREATE POLICY "Users can remove themselves"
    ON public.group_members
    FOR DELETE
    USING (auth.uid() = user_id);
