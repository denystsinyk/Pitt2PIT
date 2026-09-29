import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../layout/Layout';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return <Layout><section className="form-page"><form className="form-card" onSubmit={handleSubmit}>
    <h1>Sign in</h1><p>Use your Pitt account to continue.</p>
    {error && <div className="form-message" role="alert">{error}</div>}
    <div className="form-fields">
      <label htmlFor="email">Pitt email<input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@pitt.edu" /></label>
      <label htmlFor="password">Password<input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
    </div>
    <button className="form-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
    <p className="form-foot">New to Pitt2PIT? <Link to="/signup">Create an account</Link></p>
  </form></section></Layout>;
}
