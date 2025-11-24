import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Reusable input component with label, error, and helper text support
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-blue-500';
    
    return (
      <div className={`${widthClass}`}>
        {label && (
          <label className="block text-sm text-slate-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`bg-slate-700 text-white p-2 rounded border ${errorClass} focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${widthClass} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="text-red-400 text-xs mt-1" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-slate-400 text-xs mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
