import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading, onboardingCompleted } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-lightRoot dark:bg-forest-root">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading NutriLens...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // If onboarding is not completed, route to onboarding
    if (!onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

