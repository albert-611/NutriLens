import React, { useState } from 'react';
import { UserCheck, ChevronDown, Check } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';

export const DemoUserSelector: React.FC = () => {
  const { user, selectDemoUser, isDemoUser } = useAuth();
  const [open, setOpen] = useState(false);

  const activeDemo = DEMO_USERS.find((d) => d.id === user?.id) || DEMO_USERS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-forest-card/80 dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500/50 text-slate-700 dark:text-emerald-300 transition-all duration-150"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {isDemoUser ? activeDemo.name : user?.email || 'Logged In'}
        </span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
          Demo
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-2xl p-2 z-50 text-xs">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-forest-border/50 mb-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                Select Persona for Demo
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Switch profiles to test different budgets & constraints.
              </p>
            </div>

            <div className="space-y-1">
              {DEMO_USERS.map((demo) => {
                const isSelected = isDemoUser && user?.id === demo.id;
                return (
                  <button
                    key={demo.id}
                    onClick={() => {
                      selectDemoUser(demo.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-start justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-forest-cardHover text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-600/30'
                        : 'hover:bg-slate-50 dark:hover:bg-forest-cardHover/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{demo.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{demo.roleDescription}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
