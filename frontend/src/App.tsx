import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SignupForm } from './components/auth/SignupForm';
import { Layout } from './components/layout/Layout';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './contexts/AuthContext';

function Home() {
  const { user } = useAuth();
  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">PITT STUDENTS · AIRPORT RIDES</p>
        <h1>Getting to the airport is easier together.</h1>
        <p className="intro">Create your profile now. We’re building a simple way to find Pitt students leaving around the same time.</p>
        <div className="actions">
          <Link className="button" to={user ? '/profile' : '/signup'}>{user ? 'View your profile' : 'Create an account'}</Link>
          {!user && <Link className="button secondary" to="/login">Sign in</Link>}
        </div>
      </section>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
