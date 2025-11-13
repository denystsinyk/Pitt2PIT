export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  default_pickup_location: string;
  created_at: string;
}

export interface RideGroup {
  id: string;
  creator_id: string;
  pickup_time: string;
  pickup_location: string;
  max_capacity: number;
  current_capacity: number;
  status: 'open' | 'full' | 'departed' | 'cancelled';
  estimated_cost: number;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  status: 'pending' | 'accepted' | 'declined';
  user?: User;
}

export interface RideRequest {
  id: string;
  user_id: string;
  pickup_time: string;
  pickup_location: string;
  max_group_size: number;
  mode: 'auto_match' | 'manual_join';
  group_id: string | null;
  created_at: string;
}

export interface GroupWithMembers extends RideGroup {
  members: (GroupMember & { user: User })[];
}
