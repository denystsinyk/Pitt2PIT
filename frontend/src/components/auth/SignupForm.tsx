import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../layout/Layout';

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

export function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: '',
    default_pickup_location: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.email.endsWith('@pitt.edu')) {
      setError('Please use your @pitt.edu email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        default_pickup_location: formData.default_pickup_location,
      });

      if (result.requiresEmailConfirmation) {
        // Show success message and wait for email confirmation
        setSuccess(
          `Account created! Please check your email (${formData.email}) to confirm your account before signing in.`
        );
        // Don't navigate - user needs to confirm email first
      } else {
        // User is logged in immediately
        setSuccess('Account created successfully!');
        setTimeout(() => navigate('/profile'), 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout><section className="form-page"><form className="form-card" onSubmit={handleSubmit}>
          <h1>Create your account</h1>
          <p>A Pitt email is required. We’ll use your profile when ride matching is ready.</p>
          {error && <div className="form-message" role="alert">{error}</div>}
          {success && <div className="form-message success" role="status">{success}</div>}
          <div className="form-fields">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (@pitt.edu only)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="johndoe@pitt.edu"
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="(412) 555-0123"
              />
            </div>

            <div>
              <label htmlFor="default_pickup_location" className="block text-sm font-medium text-gray-700">
                Default Pickup Location
              </label>
              <select
                id="default_pickup_location"
                name="default_pickup_location"
                required
                value={formData.default_pickup_location}
                onChange={handleChange}
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button className="form-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          <p className="form-foot">Already have an account? <Link to="/login">Sign in</Link></p>
        </form></section></Layout>
  );
}
