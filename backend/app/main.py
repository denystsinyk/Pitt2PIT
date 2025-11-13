from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import rides

app = FastAPI(
    title="Pitt2PIT API",
    description="Backend API for Pittsburgh Airport Ride Sharing Platform",
    version="1.0.0",
)

# Configure CORS - Must be before route definitions
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(rides.router, prefix="/api/rides", tags=["rides"])


@app.get("/")
async def root():
    return {"message": "Welcome to Pitt2PIT API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
