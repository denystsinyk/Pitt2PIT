import { useEffect, useState, type FormEvent } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

type Profile = {
  email: string;
  full_name: string;
  phone_number: string;
  default_pickup_location: string;
};

const emptyProfile: Profile = { email: '', full_name: '', phone_number: '', default_pickup_location: '' };

export function ProfilePage() {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = session?.access_token;
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your profile. Try signing out and back in.');
        const data = await response.json() as Profile;
        setProfile({ ...emptyProfile, ...data });
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const token = session?.access_token;
      if (!token) throw new Error('Your session expired. Please sign in again.');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profile.full_name, phone_number: profile.phone_number, default_pickup_location: profile.default_pickup_location }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save your profile.');
      setProfile({ ...emptyProfile, ...result });
      setMessage('Profile saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return <Layout><section className="profile-page">
    <p className="eyebrow">YOUR ACCOUNT</p>
    <h1>Your profile</h1>
    <p className="subtitle">Keep your contact details and usual campus pickup point up to date.</p>
    {loading ? <p role="status">Loading profile…</p> : <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-fields">
        <label htmlFor="profile-email">Pitt email<input id="profile-email" type="email" value={profile.email || user?.email || ''} disabled /></label>
        <label htmlFor="profile-name">Full name<input id="profile-name" value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} required autoComplete="name" /></label>
        <label htmlFor="profile-phone">Phone number<input id="profile-phone" type="tel" value={profile.phone_number} onChange={(event) => setProfile({ ...profile, phone_number: event.target.value })} required autoComplete="tel" /></label>
        <label htmlFor="profile-location">Usual campus pickup location<input id="profile-location" value={profile.default_pickup_location} onChange={(event) => setProfile({ ...profile, default_pickup_location: event.target.value })} required /></label>
      </div>
      {error && <div className="form-message" role="alert">{error}</div>}
      {message && <div className="form-message success" role="status">{message}</div>}
      <button className="form-submit" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
    </form>}
  </section></Layout>;
}
