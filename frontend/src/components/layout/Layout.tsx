import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">Pitt2PIT<span>✈</span></Link>
        <nav aria-label="Main navigation">
          {user ? <><Link to="/profile">Profile</Link><button className="link-button" onClick={handleSignOut}>Sign out</button></> : <><Link to="/login">Sign in</Link><Link className="nav-cta" to="/signup">Sign up</Link></>}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
