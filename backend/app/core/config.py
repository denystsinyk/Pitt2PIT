from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    supabase_url: str = "https://placeholder.supabase.co"  # Default for testing
    supabase_key: str = "placeholder_key"  # Default for testing
    supabase_anon_key: str = "placeholder_anon_key"  # Default for testing
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
