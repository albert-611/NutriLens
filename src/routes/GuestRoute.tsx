import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-lightRoot dark:bg-forest-root">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Active authenticated sessions should be routed to the application dashboard
  // Only redirect if user exists, session is active, and the account is not marked as deleted
  if (user && session && !user.user_metadata?.account_deleted) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
