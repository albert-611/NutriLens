import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const requirements = useMemo(() => {
    return [
      { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
      { id: 'number', label: 'At least one number', met: /[0-9]/.test(password) },
      { id: 'lowercase', label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
      { id: 'uppercase', label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { label: '', color: '', percent: 0, text: '' };
    if (metCount <= 2) return { label: 'Weak', color: 'bg-rose-500', percent: 33, text: 'text-rose-500' };
    if (metCount === 3) return { label: 'Medium', color: 'bg-amber-500', percent: 66, text: 'text-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100, text: 'text-emerald-500' };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1 animate-fadeIn">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
          <span className={`font-bold ${strength.text}`}>{strength.label}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-forest-border rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-1.5 text-[11px]">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span
              className={
                req.met
                  ? 'text-slate-700 dark:text-slate-200 font-medium'
                  : 'text-slate-400 dark:text-slate-500'
              }
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

