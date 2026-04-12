import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">
        Loading session...
      </div>
    );
  }

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <>{children}</>;
}
