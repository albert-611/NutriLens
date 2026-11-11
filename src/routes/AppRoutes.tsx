import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/public/ResetPasswordPage';
import { OnboardingPage } from '../pages/public/OnboardingPage';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { DashboardPage } from '../pages/app/DashboardPage';
import { AnalyzePage } from '../pages/app/AnalyzePage';
import { ConfirmPage } from '../pages/app/ConfirmPage';
import { ReportPage } from '../pages/app/ReportPage';
import { BazarPage } from '../pages/app/BazarPage';
import { MealRescuePage } from '../pages/app/MealRescuePage';
import { ShoppingPage } from '../pages/app/ShoppingPage';
import { ProfilePage } from '../pages/app/ProfilePage';
import { SettingsPage } from '../pages/app/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest Authentication Pages */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Onboarding Flow: Redirect directly to App */}
      <Route path="/onboarding" element={<Navigate to="/app" replace />} />

      {/* Protected App Pages (Requires Authenticated User with Completed Onboarding) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="analyze" element={<AnalyzePage />} />
        <Route path="confirm" element={<ConfirmPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="bazar" element={<BazarPage />} />
        <Route path="meal-rescue" element={<MealRescuePage />} />
        <Route path="shopping" element={<ShoppingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
