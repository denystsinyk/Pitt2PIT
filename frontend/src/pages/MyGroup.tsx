import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import type { GroupWithMembers } from '../types';
import { format } from 'date-fns';

export function MyGroup() {
  const { getAccessToken } = useAuth();
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyGroup();
  }, []);

  const fetchMyGroup = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides/my-group`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group');
      }

      const data = await response.json();
      setGroup(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Group</h2>
            <p className="text-gray-600 mb-6">You're not currently part of any ride group.</p>
            <a href="/dashboard" className="btn-primary">
              Create a Ride Request
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Ride Group</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Group Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Details</h2>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pickup Time</dt>
                    <dd className="mt-1 text-lg text-gray-900">
                      {format(new Date(group.pickup_time), 'PPp')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pickup Location</dt>
                    <dd className="mt-1 text-lg text-gray-900">{group.pickup_location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Group Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        group.status === 'open' ? 'bg-green-100 text-green-800' :
                        group.status === 'full' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                    <dd className="mt-1 text-lg text-gray-900">
                      {group.current_capacity} / {group.max_capacity} people
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Group Members */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Group Members</h2>
                <div className="space-y-4">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {member.user.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">{member.user.email}</p>
                          <p className="text-sm text-pitt-blue font-medium mt-1">
                            📞 {member.user.phone_number}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {member.user.default_pickup_location}
                          </p>
                        </div>
                        {member.user_id === group.creator_id && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pitt-gold text-gray-900">
                            Creator
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost Split Card */}
            <div className="space-y-6">
              <div className="bg-pitt-blue rounded-lg shadow-md p-6 text-white sticky top-6">
                <h3 className="text-xl font-bold mb-4">Cost Split</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-200">Estimated Total</p>
                    <p className="text-3xl font-bold">${group.estimated_cost}</p>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-sm text-gray-200">Your Share</p>
                    <p className="text-4xl font-bold text-pitt-gold">
                      ${group.cost_per_person.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-200">
                    Split between {group.current_capacity} {group.current_capacity === 1 ? 'person' : 'people'}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="font-semibold mb-2">Coordination Tips</h4>
                  <ul className="text-sm text-gray-200 space-y-2">
                    <li>• Use phone numbers to coordinate pickup</li>
                    <li>• One person books the Uber/Lyft</li>
                    <li>• Others Venmo their share after</li>
                    <li>• Arrive 5-10 min early</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600">
                  If you need to make changes or have issues with your group, contact the group creator directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
