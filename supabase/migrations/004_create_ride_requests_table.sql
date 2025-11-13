-- Create ride_requests table
CREATE TABLE IF NOT EXISTS public.ride_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_location TEXT NOT NULL,
    max_group_size INTEGER NOT NULL CHECK (max_group_size >= 2 AND max_group_size <= 4),
    mode TEXT NOT NULL CHECK (mode IN ('auto_match', 'manual_join')),
    group_id UUID REFERENCES public.ride_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX ride_requests_user_idx ON public.ride_requests(user_id);
CREATE INDEX ride_requests_group_idx ON public.ride_requests(group_id);
CREATE INDEX ride_requests_created_at_idx ON public.ride_requests(created_at);

-- RLS Policies
-- Users can view their own ride requests
CREATE POLICY "Users can view own requests"
    ON public.ride_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own ride requests
CREATE POLICY "Users can create own requests"
    ON public.ride_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own ride requests
CREATE POLICY "Users can update own requests"
    ON public.ride_requests
    FOR UPDATE
    USING (auth.uid() = user_id);
