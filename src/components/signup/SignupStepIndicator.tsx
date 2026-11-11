import React from 'react';
import {
  User,
  HeartPulse,
  Utensils,
  Activity,
  Target,
  KeyRound,
  CheckCircle2,
  Check,
} from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  optional?: boolean;
}

export const SIGNUP_STEPS: StepItem[] = [
  { id: 1, title: 'Personal Information', shortTitle: 'Personal', icon: User },
  { id: 2, title: 'Health Information', shortTitle: 'Health', icon: HeartPulse, optional: true },
  { id: 3, title: 'Dietary Preferences', shortTitle: 'Diet', icon: Utensils },
  { id: 4, title: 'Lifestyle Information', shortTitle: 'Lifestyle', icon: Activity, optional: true },
  { id: 5, title: 'Nutritional Goals', shortTitle: 'Goals', icon: Target },
  { id: 6, title: 'Account Information', shortTitle: 'Account', icon: KeyRound },
  { id: 7, title: 'Review & Create', shortTitle: 'Review', icon: CheckCircle2 },
];

interface SignupStepIndicatorProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
  completedSteps: number[];
}

export const SignupStepIndicator: React.FC<SignupStepIndicatorProps> = ({
  currentStep,
  onStepClick,
  completedSteps,
}) => {
  const progressPercent = Math.round(((currentStep - 1) / (SIGNUP_STEPS.length - 1)) * 100);

  return (
    <div className="bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
      {/* Top Header & Percentage */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
          Step {currentStep} of {SIGNUP_STEPS.length}:{' '}
          <span className="text-emerald-600 dark:text-emerald-400">
            {SIGNUP_STEPS[currentStep - 1].title}
          </span>
        </span>
        <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-forest-root rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Horizontal Step Buttons */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
        {SIGNUP_STEPS.map((step) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;
          const isDone = completedSteps.includes(step.id);
          const isClickable = isDone || step.id < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => onStepClick(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isCurrent
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDone
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
              }`}
              title={`${step.title}${step.optional ? ' (Optional)' : ''}`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent
                    ? 'bg-white text-emerald-600'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-forest-border text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-3 h-3" /> : step.id}
              </span>
              <span className="hidden md:inline">{step.shortTitle}</span>
              {step.optional && (
                <span className="text-[9px] opacity-75 hidden xl:inline font-normal">
                  (Opt)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

