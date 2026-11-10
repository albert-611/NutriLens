import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LangToggle } from '../../components/common/LangToggle';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ArrowLeft, UserCheck, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { signIn, selectDemoUser, onboardingCompleted } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      setLoading(false);

      if (signInError) {
        setError(signInError.message || 'Invalid email or password. Please verify and try again.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred during sign-in.');
    }
  };

  const handleDemoLogin = (demoId: string) => {
    selectDemoUser(demoId);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-lightRoot dark:bg-forest-root text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-6 sm:my-8">
        <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-xl space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-forest-card dark:bg-forest-root border border-forest-border mx-auto flex items-center justify-center p-2 shadow-sm">
              <img src="/logo.svg" alt="NutriLens Logo" className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              Sign In to NutriLens
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access your personalized nutrition intelligence and local market workspace.
            </p>
          </div>

          {/* Quick Demo Personas Selector */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              1-Click Demo Personas (Quick Access)
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleDemoLogin(demo.id)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/80 dark:bg-forest-card/80 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-forest-cardHover text-xs transition-colors duration-150 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {demo.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      {demo.roleDescription}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-forest-border/60" />
            </div>
            <span className="relative bg-white dark:bg-forest-card px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Or account login
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                    formErrors.email
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-forest-border focus:ring-emerald-500'
                  } bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
                    formErrors.password
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-forest-border focus:ring-emerald-500'
                  } bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{formErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full shadow-lg shadow-emerald-600/20"
            >
              Sign In
            </Button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Legal Notice */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
        NutriLens is for nutritional intelligence and dietary awareness. Non-clinical SaaS prototype.
      </div>
    </div>
  );
};
