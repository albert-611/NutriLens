import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import {
  Settings,
  Lock,
  Globe,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, updatePassword, deleteAccount, isDemoUser } = useAuth();
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await updatePassword(newPassword);
      setPasswordLoading(false);

      if (error) {
        setPasswordError(error.message || 'Failed to update password.');
      } else {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err: any) {
      setPasswordLoading(false);
      setPasswordError(err?.message || 'Error updating password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const { error } = await deleteAccount();
      setDeleteLoading(false);

      if (error) {
        setDeleteError(error.message || 'Failed to delete account. Please try again.');
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setDeleteLoading(false);
      setDeleteError(err?.message || 'Error deleting account.');
    }
  };

  const handleExportData = () => {
    const accountData = {
      user: {
        id: user?.id,
        email: user?.email,
      },
      profile,
      exported_at: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(accountData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nutrilens_data_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Account Management
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your credentials, interface preferences, data portability, and privacy.
        </p>
      </div>

      {/* 1. Language & Regional Settings */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
          <Globe className="w-4 h-4 text-emerald-500" />
          Language & Regional Preferences
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Active Application Language
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select whether you prefer English or Bengali (বাংলা) across all pages.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                locale === 'en'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-forest-root text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale('bn')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                locale === 'bn'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-forest-root text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              বাংলা (Bengali)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Change Password */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
          <Lock className="w-4 h-4 text-emerald-500" />
          Change Password
        </h2>

        {passwordSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={passwordLoading}
            disabled={passwordLoading}
          >
            Update Password
          </Button>
        </form>
      </div>

      {/* 3. Data Portability / Export */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-forest-border/60">
          <Download className="w-4 h-4 text-emerald-500" />
          Data Portability & Export
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Download Personal Nutrition Data
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Export your saved profile, dietary goals, food restrictions, and budget context in JSON format.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportData}
            icon={<Download className="w-4 h-4" />}
          >
            Export JSON Data
          </Button>
        </div>
      </div>

      {/* 4. Danger Zone: Delete Account */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 pb-2 border-b border-rose-200 dark:border-rose-900/60">
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Permanently Delete NutriLens Account
            </p>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
              Permanently erases your user profile, saved meal capture logs, confirmed items, and dietary preferences. This action cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-forest-card border border-rose-300 dark:border-rose-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Confirm Permanent Account Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will immediately purge your user profile, custom preferences, and meal capture history from the database.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                To confirm, type <strong className="text-rose-600 dark:text-rose-400">DELETE</strong> below:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => {
                  setDeleteConfirmationText(e.target.value);
                  setDeleteError(null);
                }}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                loading={deleteLoading}
                disabled={deleteConfirmationText !== 'DELETE' || deleteLoading}
                onClick={handleDeleteAccount}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

