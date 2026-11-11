import React from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface TermsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  termsAgreed: boolean;
  onAcceptAndClose: () => void;
}

export const TermsDetailModal: React.FC<TermsDetailModalProps> = ({
  isOpen,
  onClose,
  termsAgreed,
  onAcceptAndClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-3xl shadow-2xl animate-scaleUp overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-detail-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-forest-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 id="terms-detail-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Terms of Service & Privacy Policy
              </h3>
              <p className="text-[10px] text-slate-400">NutriLens Version 1.0 • Effective 2026</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-cardHover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh]">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">1. Acceptance of Terms</h4>
            <p>
              By creating an account on NutriLens, you agree to these Terms and Conditions and our Privacy Policy. NutriLens provides personalized nutrition guidance and market insights based on voluntary user inputs.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">2. Health & Medical Disclaimer</h4>
            <p>
              NutriLens is an educational and lifestyle optimization tool, not a medical diagnostic service. Nutritional calculations and suggestions do not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding medical conditions, allergies, or therapeutic diets.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">3. Privacy & Sensitive Health Information</h4>
            <p>
              We treat your declared dietary exclusions, allergies, and nutritional goals with the highest confidentiality. Your data is isolated using PostgreSQL Row Level Security (RLS) and is never sold or shared with third-party advertisers.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">4. User Account & Security</h4>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">5. Changes & Revisions</h4>
            <p>
              NutriLens reserves the right to modify these terms. Significant revisions will be communicated with an updated version number and require consent.
            </p>
          </div>
        </div>

        {/* Footer with Explicit Agreement */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-forest-border bg-slate-50 dark:bg-forest-root/60 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs py-2 px-4 rounded-xl"
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onAcceptAndClose}
            className="text-xs py-2 px-5 rounded-xl flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{termsAgreed ? 'Agreed & Back to Form' : 'I Agree to Terms'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

