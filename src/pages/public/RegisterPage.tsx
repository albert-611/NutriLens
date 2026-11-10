import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LangToggle } from '../../components/common/LangToggle';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import {
  ArrowLeft,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(60, 'Full name is too long.'),
    email: z.string().trim().email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[0-9]/, 'Password must include at least one number.')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter.'),
    confirmPassword: z.string(),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, 'You must agree to the Terms and Privacy Policy.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score === 0) return { label: '', color: '', percent: 0 };
    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500', percent: 33 };
    if (score === 3) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500', percent: 66 };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', percent: 100 };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFormErrors({});

    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      agreeTerms,
    });

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
      const { error } = await signUp(email, password, fullName);

      if (error) {
        setServerError(error.message || 'Registration failed. Please check your details.');
        setLoading(false);
      } else {
        // Direct to first-time onboarding
        navigate('/onboarding', { replace: true });
      }
    } catch (err: any) {
      setServerError(err?.message || 'An unexpected error occurred during signup.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-lightRoot dark:bg-forest-root text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between max-w-lg w-full mx-auto">
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

      {/* Center Registration Card */}
      <div className="w-full max-w-lg mx-auto my-6 sm:my-8">
        <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-xl space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-forest-card dark:bg-forest-root border border-forest-border mx-auto flex items-center justify-center p-2 shadow-sm">
              <img src="/logo.svg" alt="NutriLens Logo" className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              Create Your NutriLens Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized food intelligence grounded in Bangladeshi market realities.
            </p>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder="e.g. Tariqul Islam"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                    formErrors.fullName
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-forest-border focus:ring-emerald-500'
                  } bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
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
                  placeholder="Min 8 chars, 1 number, uppercase & lowercase"
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Password strength:</span>
                    <span className={`font-bold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-forest-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {formErrors.password && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
                    formErrors.confirmPassword
                      ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-forest-border focus:ring-emerald-500'
                  } bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Privacy Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (formErrors.agreeTerms) setFormErrors((prev) => ({ ...prev, agreeTerms: '' }));
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-forest-border"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline">Terms of Service</span>{' '}
                  and acknowledge that NutriLens is an educational, non-clinical dietary guidance platform.
                </span>
              </label>
              {formErrors.agreeTerms && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{formErrors.agreeTerms}</p>
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
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Legal Notice */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
        NutriLens respects user data privacy under Row Level Security. Passwords are cryptographically salted and hashed.
      </div>
    </div>
  );
};
