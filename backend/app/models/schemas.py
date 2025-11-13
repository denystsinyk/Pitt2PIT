from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from decimal import Decimal


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    default_pickup_location: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone_number: str
    default_pickup_location: str
    created_at: datetime


class RideRequestCreate(BaseModel):
    pickup_time: datetime
    pickup_location: str
    max_group_size: int = Field(ge=2, le=4)
    mode: Literal['auto_match', 'manual_join']


class RideRequestResponse(BaseModel):
    id: str
    user_id: str
    pickup_time: datetime
    pickup_location: str
    max_group_size: int
    mode: Literal['auto_match', 'manual_join']
    group_id: Optional[str]
    created_at: datetime
    message: Optional[str] = None


class RideGroupResponse(BaseModel):
    id: str
    creator_id: str
    pickup_time: datetime
    pickup_location: str
    max_capacity: int
    current_capacity: int
    status: Literal['open', 'full', 'departed', 'cancelled']
    estimated_cost: Decimal
    created_at: datetime
    available_spots: int


class GroupMemberResponse(BaseModel):
    id: str
    group_id: str
    user_id: str
    status: Literal['pending', 'accepted', 'declined']
    joined_at: datetime
    user: UserResponse


class GroupWithMembersResponse(BaseModel):
    id: str
    creator_id: str
    pickup_time: datetime
    pickup_location: str
    max_capacity: int
    current_capacity: int
    status: Literal['open', 'full', 'departed', 'cancelled']
    estimated_cost: Decimal
    created_at: datetime
    members: list[GroupMemberResponse]
    cost_per_person: Decimal


class JoinRequestResponse(BaseModel):
    success: bool
    message: str
    group_member_id: Optional[str] = None


class CostSplitRequest(BaseModel):
    group_id: str
    base_cost: Optional[Decimal] = Field(default=Decimal("45.00"))


class CostSplitResponse(BaseModel):
    group_id: str
    total_cost: Decimal
    num_members: int
    cost_per_person: Decimal
