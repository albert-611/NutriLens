import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowIncompleteOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowIncompleteOnboarding = false,
}) => {
  const { user, loading, onboardingCompleted } = useAuth();
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has not completed onboarding and is trying to access /app/* pages
  if (!allowIncompleteOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
