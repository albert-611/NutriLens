import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NavbarAvatarMenu: React.FC = () => {
  const { user, profile, signOut, isDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/');
  };

  // Compute display name and initials
  const displayName = profile?.full_name || profile?.display_name || user?.user_metadata?.full_name || 'NutriLens Member';
  const email = user?.email || (profile as any)?.email || 'member@nutrilens.internal';
  const photoUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url || (user?.user_metadata as any)?.picture;

  const initials = React.useMemo(() => {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [displayName]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Account menu"
        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-forest-card transition-all duration-150 border border-transparent hover:border-slate-200 dark:hover:border-forest-border focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="hidden md:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
            {displayName.split(' ')[0]}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Account</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Floating Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-2xl shadow-slate-900/10 dark:shadow-black/60 p-2 z-50 animate-scaleUp"
        >
          {/* User Overview Section */}
          <div className="px-3 py-2.5 mb-1 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-100 dark:border-forest-border/50">
            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{email}</p>
            {isDemoUser && (
              <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                Demo Persona
              </span>
            )}
          </div>

          {/* Navigation Items */}
          <div className="space-y-0.5 pt-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                navigate('/app/profile');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-cardHover transition-colors"
            >
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                navigate('/app/settings');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-cardHover transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>Settings</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-1.5 border-t border-slate-100 dark:border-forest-border/70" />

          {/* Logout Action */}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{isDemoUser ? 'Exit Demo Session' : 'Logout'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

