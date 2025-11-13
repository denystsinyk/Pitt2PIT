import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, MagicMock
from app.services.matching import MatchingService
from decimal import Decimal


@pytest.fixture
def mock_supabase():
    """Create a mock Supabase client for testing."""
    return Mock()


@pytest.fixture
def matching_service(mock_supabase):
    """Create a MatchingService instance with mocked Supabase."""
    return MatchingService(mock_supabase)


def test_find_matching_group_within_time_window(matching_service, mock_supabase):
    """Test that matching finds groups within ±30 minute window."""
    pickup_time = datetime(2024, 1, 15, 10, 0)

    # Mock Supabase response with a matching group
    mock_response = Mock()
    mock_response.data = [
        {
            'id': 'group-1',
            'pickup_time': (pickup_time + timedelta(minutes=15)).isoformat(),
            'pickup_location': 'Towers',
            'current_capacity': 2,
            'max_capacity': 4,
            'status': 'open',
        }
    ]

    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.gte.return_value.lte.return_value.lte.return_value.execute.return_value = mock_response

    result = matching_service.find_matching_group(
        pickup_time,
        'Towers',
        4
    )

    assert result is not None
    assert result['id'] == 'group-1'
    assert result['current_capacity'] < result['max_capacity']


def test_find_matching_group_no_match(matching_service, mock_supabase):
    """Test that matching returns None when no groups match."""
    pickup_time = datetime(2024, 1, 15, 10, 0)

    # Mock Supabase response with no groups
    mock_response = Mock()
    mock_response.data = []

    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.gte.return_value.lte.return_value.lte.return_value.execute.return_value = mock_response

    result = matching_service.find_matching_group(
        pickup_time,
        'Towers',
        4
    )

    assert result is None


def test_find_matching_group_skip_full_groups(matching_service, mock_supabase):
    """Test that matching skips groups that are already full."""
    pickup_time = datetime(2024, 1, 15, 10, 0)

    # Mock Supabase response with only full groups
    mock_response = Mock()
    mock_response.data = [
        {
            'id': 'group-1',
            'pickup_time': pickup_time.isoformat(),
            'pickup_location': 'Towers',
            'current_capacity': 4,
            'max_capacity': 4,
            'status': 'open',
        }
    ]

    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.gte.return_value.lte.return_value.lte.return_value.execute.return_value = mock_response

    result = matching_service.find_matching_group(
        pickup_time,
        'Towers',
        4
    )

    assert result is None


def test_create_new_group(matching_service, mock_supabase):
    """Test creating a new ride group."""
    pickup_time = datetime(2024, 1, 15, 10, 0)

    # Mock Supabase response
    mock_response = Mock()
    mock_response.data = [
        {
            'id': 'new-group-1',
            'creator_id': 'user-1',
            'pickup_time': pickup_time.isoformat(),
            'pickup_location': 'Towers',
            'max_capacity': 4,
            'current_capacity': 1,
            'status': 'open',
            'estimated_cost': 45.00,
        }
    ]

    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_response

    result = matching_service.create_new_group(
        'user-1',
        pickup_time,
        'Towers',
        4
    )

    assert result['id'] == 'new-group-1'
    assert result['creator_id'] == 'user-1'
    assert result['current_capacity'] == 1
    assert result['status'] == 'open'


def test_calculate_cost_split(matching_service, mock_supabase):
    """Test cost split calculation."""
    # Mock Supabase response
    mock_response = Mock()
    mock_response.data = {
        'current_capacity': 4
    }

    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

    result = matching_service.calculate_cost_split('group-1', Decimal('48.00'))

    assert result['total_cost'] == Decimal('48.00')
    assert result['num_members'] == 4
    assert result['cost_per_person'] == Decimal('12.00')


def test_calculate_cost_split_default_cost(matching_service, mock_supabase):
    """Test cost split calculation with default base cost."""
    # Mock Supabase response
    mock_response = Mock()
    mock_response.data = {
        'current_capacity': 3
    }

    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response

    result = matching_service.calculate_cost_split('group-1')

    assert result['total_cost'] == Decimal('45.00')
    assert result['num_members'] == 3
    assert result['cost_per_person'] == Decimal('15.00')


def test_add_member_to_group_with_approval(matching_service, mock_supabase):
    """Test adding a member to a group with approval required."""
    # Mock group response
    group_response = Mock()
    group_response.data = {
        'id': 'group-1',
        'current_capacity': 2,
        'max_capacity': 4,
    }

    # Mock member insert response
    member_response = Mock()
    member_response.data = [
        {
            'id': 'member-1',
            'group_id': 'group-1',
            'user_id': 'user-1',
            'status': 'pending',
        }
    ]

    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = group_response
    mock_supabase.table.return_value.insert.return_value.execute.return_value = member_response

    result = matching_service.add_member_to_group('group-1', 'user-1', require_approval=True)

    assert result['status'] == 'pending'
    assert result['user_id'] == 'user-1'


def test_add_member_to_full_group_raises_error(matching_service, mock_supabase):
    """Test that adding a member to a full group raises an error."""
    # Mock group response with full capacity
    group_response = Mock()
    group_response.data = {
        'id': 'group-1',
        'current_capacity': 4,
        'max_capacity': 4,
    }

    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = group_response

    with pytest.raises(Exception, match="Group is already full"):
        matching_service.add_member_to_group('group-1', 'user-1')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
