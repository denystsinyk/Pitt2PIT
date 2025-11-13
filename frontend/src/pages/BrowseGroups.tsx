import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import type { RideGroup } from '../types';
import { format } from 'date-fns';

interface RideGroupWithSpots extends RideGroup {
  available_spots: number;
}

export function BrowseGroups() {
  const { getAccessToken } = useAuth();
  const [groups, setGroups] = useState<RideGroupWithSpots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    setJoiningGroup(groupId);
    setError('');

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rides/join/${groupId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to join group');
      }

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchGroups(); // Refresh groups
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setJoiningGroup(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pitt-blue"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Ride Groups</h1>
          <p className="text-gray-600 mb-8">Find and join available ride groups heading to PIT</p>

          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Groups Available</h2>
              <p className="text-gray-600 mb-6">
                Be the first to create a ride group for your departure time!
              </p>
              <a href="/dashboard" className="btn-primary">
                Create Ride Request
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {format(new Date(group.pickup_time), 'PPp')}
                      </h3>
                      <p className="text-sm text-gray-600">{group.pickup_location}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {group.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium text-gray-900">
                        {group.current_capacity} / {group.max_capacity}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available spots:</span>
                      <span className="font-medium text-pitt-blue">
                        {group.available_spots} {group.available_spots === 1 ? 'spot' : 'spots'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estimated cost:</span>
                      <span className="font-medium text-gray-900">
                        ${group.estimated_cost}
                      </span>
                    </div>

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Your share:</span>
                        <span className="font-bold text-pitt-gold text-lg">
                          ${(group.estimated_cost / (group.current_capacity + 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={
                      joiningGroup === group.id ||
                      group.available_spots === 0
                    }
                    className={`w-full ${
                      group.available_spots === 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    {joiningGroup === group.id
                      ? 'Requesting...'
                      : group.available_spots === 0
                      ? 'Full'
                      : 'Request to Join'}
                  </button>

                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Requires creator approval
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Join</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>1. Browse available groups that match your schedule</li>
              <li>2. Click "Request to Join" on a group you'd like to join</li>
              <li>3. Wait for the group creator to approve your request</li>
              <li>4. Once approved, check "My Group" for member details</li>
              <li>5. Coordinate with group members via phone</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
