from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.models.schemas import (
    RideRequestCreate,
    RideRequestResponse,
    RideGroupResponse,
    GroupWithMembersResponse,
    JoinRequestResponse,
    CostSplitRequest,
    CostSplitResponse,
    GroupMemberResponse,
    UserResponse,
)
from app.db.supabase_client import get_supabase
from app.services.matching import MatchingService
from app.core.auth import get_user_id_from_token
from supabase import Client

router = APIRouter()


@router.post("/create", response_model=RideRequestResponse)
async def create_ride_request(
    request: RideRequestCreate,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_user_id_from_token),
):
    """Create a new ride request and optionally auto-match."""
    # Check if user profile exists
    user_check = supabase.table('users').select('id').eq('id', user_id).execute()
    if not user_check.data or len(user_check.data) == 0:
        raise HTTPException(
            status_code=400,
            detail="User profile not found. Please log out and log back in to complete your profile setup."
        )

    matching_service = MatchingService(supabase)

    # Create ride request record
    ride_request_data = {
        'user_id': user_id,
        'pickup_time': request.pickup_time.isoformat(),
        'pickup_location': request.pickup_location,
        'max_group_size': request.max_group_size,
        'mode': request.mode,
    }

    ride_request_response = supabase.table('ride_requests').insert(
        ride_request_data
    ).execute()

    if not ride_request_response.data:
        raise HTTPException(status_code=500, detail="Failed to create ride request")

    ride_request = ride_request_response.data[0]
    group_id = None
    message = "Ride request created successfully"

    # If auto-match mode, try to find or create a group
    if request.mode == 'auto_match':
        # Try to find existing group
        matching_group = matching_service.find_matching_group(
            request.pickup_time,
            request.pickup_location,
            request.max_group_size,
        )

        if matching_group:
            # Add user to existing group
            try:
                matching_service.add_member_to_group(
                    matching_group['id'],
                    user_id,
                    require_approval=False,  # Auto-match doesn't require approval
                )
                group_id = matching_group['id']
                message = "Matched with existing group!"
            except Exception as e:
                # If adding to group fails, create new group
                new_group = matching_service.create_new_group(
                    user_id,
                    request.pickup_time,
                    request.pickup_location,
                    request.max_group_size,
                )
                group_id = new_group['id']
                message = "Created new group, waiting for others to join"
        else:
            # Create new group
            new_group = matching_service.create_new_group(
                user_id,
                request.pickup_time,
                request.pickup_location,
                request.max_group_size,
            )
            group_id = new_group['id']

            # Add creator as first member
            matching_service.add_member_to_group(
                group_id,
                user_id,
                require_approval=False,
            )
            message = "Created new group, waiting for others to join"

        # Update ride request with group_id
        supabase.table('ride_requests').update(
            {'group_id': group_id}
        ).eq('id', ride_request['id']).execute()

    # Update the local ride_request dict with group_id and message
    ride_request['group_id'] = group_id

    return RideRequestResponse(
        **ride_request,
        message=message,
    )


@router.get("/groups", response_model=list[RideGroupResponse])
async def get_available_groups(
    supabase: Client = Depends(get_supabase),
    pickup_time_start: Optional[str] = None,
    pickup_time_end: Optional[str] = None,
    available_spots: Optional[int] = None,
):
    """Get all available ride groups with optional filters."""
    query = supabase.table('ride_groups').select('*').eq('status', 'open')

    if pickup_time_start:
        query = query.gte('pickup_time', pickup_time_start)

    if pickup_time_end:
        query = query.lte('pickup_time', pickup_time_end)

    response = query.execute()

    if not response.data:
        return []

    # Filter by available spots if specified
    groups = []
    for group in response.data:
        available = group['max_capacity'] - group['current_capacity']
        if available_spots is None or available >= available_spots:
            groups.append(
                RideGroupResponse(
                    **group,
                    available_spots=available,
                )
            )

    return groups


@router.post("/join/{group_id}", response_model=JoinRequestResponse)
async def join_group(
    group_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_user_id_from_token),
):
    """Request to join a ride group (requires approval)."""
    matching_service = MatchingService(supabase)

    try:
        member = matching_service.add_member_to_group(
            group_id,
            user_id,
            require_approval=True,
        )

        return JoinRequestResponse(
            success=True,
            message="Join request sent. Waiting for group creator approval.",
            group_member_id=member['id'],
        )
    except Exception as e:
        return JoinRequestResponse(
            success=False,
            message=str(e),
        )


@router.get("/my-group", response_model=Optional[GroupWithMembersResponse])
async def get_my_group(
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_user_id_from_token),
):
    """Get the current user's active group with all member details."""
    # Find user's active group membership
    member_response = supabase.table('group_members').select(
        'group_id'
    ).eq('user_id', user_id).eq('status', 'accepted').execute()

    if not member_response.data:
        return None

    group_id = member_response.data[0]['group_id']

    # Get group details
    group_response = supabase.table('ride_groups').select('*').eq(
        'id', group_id
    ).single().execute()

    if not group_response.data:
        return None

    group = group_response.data

    # Get all accepted members with user details
    members_response = supabase.table('group_members').select(
        '*, users(*)'
    ).eq('group_id', group_id).eq('status', 'accepted').execute()

    members = []
    if members_response.data:
        for member_data in members_response.data:
            user_data = member_data.pop('users')
            members.append(
                GroupMemberResponse(
                    **member_data,
                    user=UserResponse(**user_data),
                )
            )

    # Calculate cost per person
    matching_service = MatchingService(supabase)
    cost_split = matching_service.calculate_cost_split(group_id)

    return GroupWithMembersResponse(
        **group,
        members=members,
        cost_per_person=cost_split['cost_per_person'],
    )


@router.post("/calculate-split", response_model=CostSplitResponse)
async def calculate_cost_split(
    request: CostSplitRequest,
    supabase: Client = Depends(get_supabase),
):
    """Calculate the cost split for a group."""
    matching_service = MatchingService(supabase)

    try:
        result = matching_service.calculate_cost_split(
            request.group_id,
            request.base_cost,
        )
        return CostSplitResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/approve-member/{member_id}")
async def approve_member_request(
    member_id: str,
    group_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_user_id_from_token),
):
    """Approve a pending join request (group creator only)."""
    # Verify user is the group creator
    group_response = supabase.table('ride_groups').select(
        'creator_id'
    ).eq('id', group_id).single().execute()

    if not group_response.data:
        raise HTTPException(status_code=404, detail="Group not found")

    if group_response.data['creator_id'] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the group creator can approve members",
        )

    matching_service = MatchingService(supabase)
    success = matching_service.approve_member(member_id, group_id)

    if not success:
        raise HTTPException(status_code=400, detail="Failed to approve member")

    return {"success": True, "message": "Member approved successfully"}


@router.get("/pending-requests/{group_id}")
async def get_pending_requests(
    group_id: str,
    supabase: Client = Depends(get_supabase),
    user_id: str = Depends(get_user_id_from_token),
):
    """Get all pending join requests for a group (group creator only)."""
    # Verify user is the group creator
    group_response = supabase.table('ride_groups').select(
        'creator_id'
    ).eq('id', group_id).single().execute()

    if not group_response.data:
        raise HTTPException(status_code=404, detail="Group not found")

    if group_response.data['creator_id'] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the group creator can view pending requests",
        )

    # Get pending members with user details
    pending_response = supabase.table('group_members').select(
        '*, users(*)'
    ).eq('group_id', group_id).eq('status', 'pending').execute()

    if not pending_response.data:
        return []

    members = []
    for member_data in pending_response.data:
        user_data = member_data.pop('users')
        members.append(
            GroupMemberResponse(
                **member_data,
                user=UserResponse(**user_data),
            )
        )

    return members
