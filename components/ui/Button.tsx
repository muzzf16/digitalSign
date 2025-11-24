import React from 'react';

export type ButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'ghost' | 'blue' | 'emerald';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/20',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg',
  warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg',
  ghost: 'bg-slate-700 hover:bg-slate-600 text-white',
  blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg',
  emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

/**
 * Reusable button component with consistent styling
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      variant = 'primary', 
      size = 'md', 
      fullWidth = false,
      loading = false,
      icon,
      children, 
      className = '',
      disabled,
      ...props 
    },
    ref
  ) => {
    const baseClasses = 'rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
    const widthClass = fullWidth ? 'w-full' : '';
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && !loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
