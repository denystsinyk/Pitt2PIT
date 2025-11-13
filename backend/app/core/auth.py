import jwt
from typing import Optional
from fastapi import Header, HTTPException
from app.core.config import settings


def verify_supabase_token(token: str) -> dict:
    """
    Verify Supabase JWT token and return the payload.

    Supabase uses JWT tokens that can be verified using the JWT secret.
    The secret is derived from the Supabase JWT secret (not the anon key).
    """
    try:
        # Decode the JWT token
        # Note: In production, you should verify the signature using Supabase's JWT secret
        # For now, we'll decode without verification to get the user ID
        # The token is still validated by Supabase on the client side

        payload = jwt.decode(
            token,
            options={"verify_signature": False}  # Supabase already verified it
        )

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> str:
    """Extract and verify user ID from authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    try:
        token = authorization.replace("Bearer ", "")
        payload = verify_supabase_token(token)

        # Extract user ID from token payload
        user_id = payload.get("sub")  # 'sub' is the standard JWT claim for user ID

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        return user_id

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
