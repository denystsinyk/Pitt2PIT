from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client
# If using placeholder values, this will fail - set real values in .env
try:
    supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
except Exception as e:
    # Fallback for development without real Supabase
    print(f"⚠️  Warning: Could not connect to Supabase: {e}")
    print(f"⚠️  Set real SUPABASE_URL and SUPABASE_KEY in backend/.env")
    supabase = None  # type: ignore


def get_supabase() -> Client:
    """Get Supabase client instance."""
    if supabase is None:
        raise Exception(
            "Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY in .env"
        )
    return supabase
