from supabase import Client
from typing import Optional


def ensure_user_profile_exists(supabase: Client, user_id: str, email: Optional[str] = None) -> bool:
    """
    Ensure a user profile exists in the public.users table.
    Creates a minimal profile if it doesn't exist.

    Returns True if profile exists or was created, False if creation failed.
    """
    try:
        # Check if profile exists
        response = supabase.table('users').select('id').eq('id', user_id).execute()

        if response.data and len(response.data) > 0:
            # Profile exists
            return True

        # Profile doesn't exist - create a minimal one
        if not email:
            # Try to get email from auth.users
            # Note: This might not work with service role key
            # In that case, we'll create with a placeholder
            email = f"{user_id}@unknown.com"

        # Create minimal profile
        profile_data = {
            'id': user_id,
            'email': email,
            'full_name': 'User',  # Placeholder
            'phone_number': '',  # Will need to be updated by user
            'default_pickup_location': 'Other',  # Default location
        }

        insert_response = supabase.table('users').insert(profile_data).execute()

        if insert_response.data:
            return True

        return False

    except Exception as e:
        print(f"Error ensuring user profile exists: {e}")
        return False
