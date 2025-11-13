import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-pitt-blue shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to={user ? '/dashboard' : '/'} className="flex items-center">
                <span className="text-2xl font-bold text-white">Pitt2PIT</span>
                <span className="ml-2 text-pitt-gold">✈️</span>
              </Link>
              {user && (
                <div className="ml-10 flex space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-white hover:text-pitt-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/browse"
                    className="text-white hover:text-pitt-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Browse Groups
                  </Link>
                  <Link
                    to="/my-group"
                    className="text-white hover:text-pitt-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Group
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-pitt-gold px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-white hover:text-pitt-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-pitt-gold text-gray-900 hover:bg-pitt-gold/90 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
