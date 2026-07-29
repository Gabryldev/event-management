import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: optional array of allowed roles. If omitted, any logged-in user passes.
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-muted">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-display">You don't have access to this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
