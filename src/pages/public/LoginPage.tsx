import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { Button } from '../../components/common/Button';
import { LangToggle } from '../../components/common/LangToggle';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const rawFrom = (location.state as any)?.from?.pathname;
  const targetDestination = rawFrom && !['/login', '/register', '/onboarding'].includes(rawFrom) ? rawFrom : '/app';
  const queryParams = new URLSearchParams(location.search);
  const isPendingConfirmation = queryParams.get('registered') === 'pending_confirmation';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      setLoading(false);
      if (res.error) {
        setError(res.error.message || 'Google sign-in failed. Please try again.');
      } else if (res.isNewUser) {
        navigate('/register?mode=google', { replace: true });
      } else {
        navigate(targetDestination, { replace: true });
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred during Google sign-in.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
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
        // Map common Supabase error messages to friendly, accurate text
        const msg = signInError.message || '';
        if (msg.toLowerCase().includes('permanently deleted') || msg.toLowerCase().includes('deleted account')) {
          setError('This account was permanently deleted. You cannot log in with a deleted account.');
        } else if (msg.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid email or password. Unregistered accounts cannot log in.');
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          setError('Email address has not been confirmed. Please check your inbox for the confirmation link.');
        } else {
          setError(msg || 'Authentication failed. Please verify your credentials and try again.');
        }
      } else {
        navigate(targetDestination, { replace: true });
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred during sign-in.');
    }
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

          {isPendingConfirmation && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <strong className="font-semibold block mb-0.5">Account Registered</strong>
                <span>Please check your inbox to verify your email address before signing in.</span>
              </div>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <strong className="font-semibold block mb-0.5">Database Connection Notice</strong>
                <span>Supabase environment variables are not configured in <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded font-mono text-[10px]">.env.local</code>. Real credential verification requires an active Supabase project.</span>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !isSupabaseConfigured}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root hover:bg-slate-50 dark:hover:bg-forest-card text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2.5 shadow-sm transition-all duration-150 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-forest-border/60" />
            </div>
            <span className="relative bg-white dark:bg-forest-card px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Or email login
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
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-forest-root border transition-all duration-150 focus:outline-none focus:ring-2 ${
                    formErrors.email
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-forest-border focus:border-emerald-500 focus:ring-emerald-500/20'
                  } text-slate-900 dark:text-white placeholder:text-slate-400`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  {formErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-forest-root border transition-all duration-150 focus:outline-none focus:ring-2 ${
                    formErrors.password
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-forest-border focus:border-emerald-500 focus:ring-emerald-500/20'
                  } text-slate-900 dark:text-white placeholder:text-slate-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  {formErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={loading}
              className="w-full mt-2 font-bold shadow-md"
            >
              Sign In
            </Button>
          </form>

          {/* Bottom Link to Register */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-forest-border/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Create Account →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-md w-full mx-auto text-center py-2">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Protected by Supabase Auth with Row Level Security &amp; JWT encryption.
        </p>
      </div>
    </div>
  );
};
