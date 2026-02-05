// Protected route wrapper - redirects to login if not authenticated
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { isAuthenticated } from '../../lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
