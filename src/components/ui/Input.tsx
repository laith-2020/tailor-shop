import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full text-right space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 mr-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-slate-900 text-sm placeholder:text-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-500',
              icon && 'pr-10',
              error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-rose-600 animate-fadeIn">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
