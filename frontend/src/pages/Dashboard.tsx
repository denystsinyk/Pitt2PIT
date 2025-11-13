import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

const CAMPUS_LOCATIONS = [
  'Towers',
  'Lothrop Hall',
  'Holland Hall',
  'Nordenberg Hall',
  'Sutherland Hall',
  'Bouquet Gardens',
  'Ruskin Hall',
  'Pennsylvania Hall',
  'Forbes Hall',
  'Brackenridge Hall',
  'Cathedral of Learning',
  'Hillman Library',
  'Petersen Events Center',
  'Other',
];

export function Dashboard() {
  const { getAccessToken } = useAuth();
  const [formData, setFormData] = useState({
    pickup_time: '',
    pickup_location: '',
    max_group_size: 4,
    mode: 'auto_match' as 'auto_match' | 'manual_join',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pickup_time: new Date(formData.pickup_time).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create ride request');
      }

      const data = await response.json();
      setSuccess(data.message || 'Ride request created successfully!');

      // Reset form
      setFormData({
        pickup_time: '',
        pickup_location: '',
        max_group_size: 4,
        mode: 'auto_match',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ride request';
      setError(errorMessage);

      // If profile error, show additional help
      if (errorMessage.includes('profile not found') || errorMessage.includes('log out and log back in')) {
        setError(errorMessage + ' Click "Sign Out" in the navigation, then sign in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'max_group_size' ? parseInt(value) : value,
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 mb-8">Create a new ride request or browse existing groups</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Ride Request Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Ride Request</h2>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="pickup_time" className="block text-sm font-medium text-gray-700">
                    Pickup Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="pickup_time"
                    name="pickup_time"
                    required
                    value={formData.pickup_time}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pitt-blue focus:border-pitt-blue sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="pickup_location" className="block text-sm font-medium text-gray-700">
                    Pickup Location
                  </label>
                  <select
                    id="pickup_location"
                    name="pickup_location"
                    required
                    value={formData.pickup_location}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pitt-blue focus:border-pitt-blue sm:text-sm"
                  >
                    <option value="">Select a location</option>
                    {CAMPUS_LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="max_group_size" className="block text-sm font-medium text-gray-700">
                    Maximum Group Size
                  </label>
                  <select
                    id="max_group_size"
                    name="max_group_size"
                    required
                    value={formData.max_group_size}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pitt-blue focus:border-pitt-blue sm:text-sm"
                  >
                    <option value={2}>2 people</option>
                    <option value={3}>3 people</option>
                    <option value={4}>4 people</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matching Mode
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mode"
                        value="auto_match"
                        checked={formData.mode === 'auto_match'}
                        onChange={handleChange}
                        className="h-4 w-4 text-pitt-blue focus:ring-pitt-blue border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-900">
                        <strong>Auto-match</strong> - Automatically join or create a group
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mode"
                        value="manual_join"
                        checked={formData.mode === 'manual_join'}
                        onChange={handleChange}
                        className="h-4 w-4 text-pitt-blue focus:ring-pitt-blue border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-900">
                        <strong>Manual</strong> - Browse and request to join groups
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Creating...' : 'Create Ride Request'}
                </button>
              </form>
            </div>

            {/* Info Card */}
            <div className="space-y-6">
              <div className="bg-pitt-blue rounded-lg shadow-md p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Cost Savings Calculator</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Alone:</span>
                    <span className="font-bold">$45.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With 2 people:</span>
                    <span className="font-bold text-pitt-gold">$22.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With 3 people:</span>
                    <span className="font-bold text-pitt-gold">$15.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With 4 people:</span>
                    <span className="font-bold text-pitt-gold">$11.25</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-200">
                  Save up to 73% by sharing your ride to PIT!
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">How It Works</h3>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex">
                    <span className="font-bold text-pitt-blue mr-2">1.</span>
                    <span>Fill out the ride request form with your pickup details</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-pitt-blue mr-2">2.</span>
                    <span>Our algorithm finds groups with similar times (±30 min)</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-pitt-blue mr-2">3.</span>
                    <span>Get matched automatically or browse and join manually</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-pitt-blue mr-2">4.</span>
                    <span>Coordinate with your group via phone and split costs on Venmo</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
