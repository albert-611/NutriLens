import React from 'react';
import clsx from 'clsx';
import { SpecularButton } from '../animations/SpecularButton';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  const variantConfig = {
    primary: {
      tint: '#10b981',
      tintOpacity: 1,
      textColor: '#ffffff',
      lineColor: '#6ee7b7',
      baseColor: '#059669',
      glow: 1.5,
      intensity: 1.2,
      idleIntensity: 0.45,
      className: 'font-bold shadow-lg shadow-emerald-500/25',
    },
    secondary: {
      tint: 'rgba(16, 185, 129, 0.12)',
      tintOpacity: 1,
      textColor: '#6ee7b7',
      lineColor: '#34d399',
      baseColor: 'rgba(16, 185, 129, 0.35)',
      glow: 1.3,
      intensity: 1.1,
      idleIntensity: 0.35,
      className: 'border border-emerald-500/30 font-semibold',
    },
    outline: {
      tint: 'rgba(16, 185, 129, 0.05)',
      tintOpacity: 1,
      textColor: 'inherit',
      lineColor: '#34d399',
      baseColor: 'rgba(16, 185, 129, 0.35)',
      glow: 1.3,
      intensity: 1.1,
      idleIntensity: 0.35,
      className: 'border border-slate-300 dark:border-forest-border text-slate-800 dark:text-emerald-100 font-semibold',
    },
    ghost: {
      tint: 'transparent',
      tintOpacity: 0,
      textColor: 'inherit',
      lineColor: '#10b981',
      baseColor: 'transparent',
      glow: 1.1,
      intensity: 1.0,
      idleIntensity: 0.25,
      className: 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 font-medium',
    },
    danger: {
      tint: '#e11d48',
      tintOpacity: 1,
      textColor: '#ffffff',
      lineColor: '#fda4af',
      baseColor: '#be123c',
      glow: 1.5,
      intensity: 1.2,
      idleIntensity: 0.4,
      className: 'font-bold shadow-lg shadow-rose-500/25',
    },
  }[variant];

  const sizeRadius = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <SpecularButton
      size={size}
      radius={sizeRadius}
      tint={variantConfig.tint}
      tintOpacity={variantConfig.tintOpacity}
      textColor={variantConfig.textColor}
      lineColor={variantConfig.lineColor}
      baseColor={variantConfig.baseColor}
      glow={variantConfig.glow}
      intensity={variantConfig.intensity}
      idleIntensity={variantConfig.idleIntensity}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={clsx(variantConfig.className, className)}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>

      {!loading && icon && iconPosition === 'right' ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
    </SpecularButton>
  );
};
