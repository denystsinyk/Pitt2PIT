-- Create ride_groups table
CREATE TABLE IF NOT EXISTS public.ride_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location TEXT NOT NULL,
    max_capacity INTEGER NOT NULL CHECK (max_capacity >= 2 AND max_capacity <= 4),
    current_capacity INTEGER NOT NULL DEFAULT 1 CHECK (current_capacity >= 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'departed', 'cancelled')),
    estimated_cost DECIMAL(10, 2) NOT NULL DEFAULT 45.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ride_groups ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX ride_groups_pickup_time_idx ON public.ride_groups(pickup_time);
CREATE INDEX ride_groups_pickup_location_idx ON public.ride_groups(pickup_location);
CREATE INDEX ride_groups_status_idx ON public.ride_groups(status);
CREATE INDEX ride_groups_creator_idx ON public.ride_groups(creator_id);

-- RLS Policies (only policies that don't reference other tables)
-- Anyone authenticated can view open groups
CREATE POLICY "Authenticated users can view open groups"
    ON public.ride_groups
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND status = 'open'
    );

-- Users can create groups
CREATE POLICY "Authenticated users can create groups"
    ON public.ride_groups
    FOR INSERT
    WITH CHECK (
        auth.uid() = creator_id
        AND auth.role() = 'authenticated'
    );

-- Group creators can update their groups
CREATE POLICY "Creators can update their groups"
    ON public.ride_groups
    FOR UPDATE
    USING (auth.uid() = creator_id);
