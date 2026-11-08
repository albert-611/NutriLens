import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { LangToggle } from '../../components/common/LangToggle';
import { ArrowLeft, UserCheck, Lock, Mail, User, Store } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signUp, selectDemoUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Failed to register account.');
    } else {
      navigate('/app', { replace: true });
    }
  };

  const handleDemoStart = (demoId: string) => {
    selectDemoUser(demoId);
    navigate('/app', { replace: true });
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
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Center Registration Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-xl">
          
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-forest-card dark:bg-forest-root border border-forest-border mx-auto flex items-center justify-center p-2 shadow-sm">
              <img src="/logo.svg" alt="NutriLens Logo" className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Create NutriLens Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Start your plate-to-market nutrition intelligence journey.
            </p>
          </div>

          {/* Quick Demo Personas Start */}
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Quick Start with Verified Persona
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleDemoStart(demo.id)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/80 dark:bg-forest-card/80 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-forest-cardHover text-xs transition-colors duration-150 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{demo.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{demo.roleDescription}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Select →</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-forest-border/60" />
            </div>
            <span className="relative bg-white dark:bg-forest-card px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Or register directly
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tariqul Islam"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tariqul@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 dark:text-slate-400 max-w-md mx-auto">
        By registering, you acknowledge this is an educational nutrition intelligence prototype.
      </div>
    </div>
  );
};
