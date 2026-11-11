import React from 'react';
import { ShieldCheck, FileText, X, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';

interface TermsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewTerms: () => void;
}

export const TermsConfirmationModal: React.FC<TermsConfirmationModalProps> = ({
  isOpen,
  onClose,
  onReviewTerms,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-cardHover transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3
            id="terms-modal-title"
            className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Agreement Required to Create Account
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Before creating your NutriLens account, please review and agree to our{' '}
            <span className="font-semibold text-slate-900 dark:text-white">Terms and Conditions</span>{' '}
            and{' '}
            <span className="font-semibold text-slate-900 dark:text-white">Privacy Policy</span>.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              NutriLens Health Privacy Commitment
            </p>
            <p>
              Your dietary restrictions, food allergies, and health goals are stored securely with Row Level Security (RLS) and never sold to third-party advertisers.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-1/2 text-xs py-2.5 rounded-xl border-slate-300 dark:border-forest-border"
          >
            Cancel / Go Back
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onReviewTerms}
            className="w-full sm:w-1/2 text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Review Terms</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
