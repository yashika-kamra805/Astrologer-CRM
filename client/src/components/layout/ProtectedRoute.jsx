import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../feedback/Spinner';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner className="min-h-screen" />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
