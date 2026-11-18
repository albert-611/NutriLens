import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LangToggle } from '../../components/common/LangToggle';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const emailSchema = z.string().trim().email('Please enter a valid email address.');

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await resetPasswordForEmail(email);
      setLoading(false);

      if (resetError) {
        setError(resetError.message || 'Unable to send recovery email. Please check the address.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-lightRoot dark:bg-forest-root text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
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
          <div className="text-center space-y-2">
            <img 
              src="/logo.svg" 
              alt="NutriLens Logo" 
              className="w-14 h-14 mx-auto object-contain transition-transform duration-200 hover:scale-105" 
            />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your registered email address and we will send you a secure recovery link.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recovery Link Dispatched
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>, you will receive an email with instructions to securely reset your password.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
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
                      setError(null);
                    }}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full shadow-lg shadow-emerald-600/20"
              >
                Send Recovery Email
              </Button>
            </form>
          )}

          {/* Footer note */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 max-w-md mx-auto">
        Password recovery links expire after 1 hour for your security.
      </div>
    </div>
  );
};

