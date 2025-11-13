from datetime import datetime, timedelta
from typing import Optional
from supabase import Client
from decimal import Decimal


class MatchingService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.time_window_minutes = 30
        self.base_cost = Decimal("45.00")  # Default estimated cost to PIT

    def find_matching_group(
        self,
        pickup_time: datetime,
        pickup_location: str,
        max_group_size: int
    ) -> Optional[dict]:
        """Find an existing group that matches the user's criteria."""
        time_lower = pickup_time - timedelta(minutes=self.time_window_minutes)
        time_upper = pickup_time + timedelta(minutes=self.time_window_minutes)

        # Query for open groups within the time window
        response = self.supabase.table('ride_groups').select('*').eq(
            'status', 'open'
        ).eq(
            'pickup_location', pickup_location
        ).gte(
            'pickup_time', time_lower.isoformat()
        ).lte(
            'pickup_time', time_upper.isoformat()
        ).lte(
            'max_capacity', max_group_size
        ).execute()

        if response.data:
            # Find groups with available capacity
            for group in response.data:
                if group['current_capacity'] < group['max_capacity']:
                    return group

        return None

    def create_new_group(
        self,
        creator_id: str,
        pickup_time: datetime,
        pickup_location: str,
        max_capacity: int
    ) -> dict:
        """Create a new ride group."""
        group_data = {
            'creator_id': creator_id,
            'pickup_time': pickup_time.isoformat(),
            'pickup_location': pickup_location,
            'max_capacity': max_capacity,
            'current_capacity': 1,
            'status': 'open',
            'estimated_cost': float(self.base_cost),
        }

        response = self.supabase.table('ride_groups').insert(group_data).execute()

        if response.data:
            return response.data[0]

        raise Exception("Failed to create ride group")

    def add_member_to_group(
        self,
        group_id: str,
        user_id: str,
        require_approval: bool = True
    ) -> dict:
        """Add a member to a ride group."""
        # Get current group
        group_response = self.supabase.table('ride_groups').select(
            '*'
        ).eq('id', group_id).single().execute()

        if not group_response.data:
            raise Exception("Group not found")

        group = group_response.data

        # Check capacity
        if group['current_capacity'] >= group['max_capacity']:
            raise Exception("Group is already full")

        # Add member with pending or accepted status
        member_data = {
            'group_id': group_id,
            'user_id': user_id,
            'status': 'pending' if require_approval else 'accepted',
        }

        member_response = self.supabase.table('group_members').insert(
            member_data
        ).execute()

        if not member_response.data:
            raise Exception("Failed to add member to group")

        # If auto-accepted, update group capacity
        if not require_approval:
            self._update_group_capacity(group_id, group['current_capacity'] + 1)

        return member_response.data[0]

    def approve_member(self, member_id: str, group_id: str) -> bool:
        """Approve a pending member and update group capacity."""
        # Update member status
        member_response = self.supabase.table('group_members').update(
            {'status': 'accepted'}
        ).eq('id', member_id).execute()

        if not member_response.data:
            return False

        # Get current group capacity
        group_response = self.supabase.table('ride_groups').select(
            'current_capacity, max_capacity'
        ).eq('id', group_id).single().execute()

        if group_response.data:
            new_capacity = group_response.data['current_capacity'] + 1
            self._update_group_capacity(group_id, new_capacity)

            # Check if group is now full
            if new_capacity >= group_response.data['max_capacity']:
                self.supabase.table('ride_groups').update(
                    {'status': 'full'}
                ).eq('id', group_id).execute()

        return True

    def _update_group_capacity(self, group_id: str, new_capacity: int):
        """Update the current capacity of a group."""
        self.supabase.table('ride_groups').update(
            {'current_capacity': new_capacity}
        ).eq('id', group_id).execute()

    def calculate_cost_split(self, group_id: str, base_cost: Optional[Decimal] = None) -> dict:
        """Calculate cost per person for a group."""
        if base_cost is None:
            base_cost = self.base_cost

        # Get group with members count
        group_response = self.supabase.table('ride_groups').select(
            'current_capacity'
        ).eq('id', group_id).single().execute()

        if not group_response.data:
            raise Exception("Group not found")

        num_members = group_response.data['current_capacity']

        if num_members == 0:
            raise Exception("Group has no members")

        cost_per_person = base_cost / num_members

        return {
            'group_id': group_id,
            'total_cost': base_cost,
            'num_members': num_members,
            'cost_per_person': cost_per_person,
        }
