import { forwardRef } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, required, className = '', children }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs font-semibold text-ink-700 mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-danger">*</span>}
      </div>
      {children}
      {error ? (
        <div className="text-xs text-danger mt-1">{error}</div>
      ) : hint ? (
        <div className="text-xs text-ink-500 mt-1">{hint}</div>
      ) : null}
    </label>
  );
}

const inputBase =
  'h-10 w-full rounded-sm border border-ink-300 bg-white px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-ink-50 disabled:text-ink-500';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...rest }, ref) => (
    <input ref={ref} className={`${inputBase} ${className}`} {...rest} />
  ),
);
TextInput.displayName = 'TextInput';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...rest }, ref) => (
    <select
      ref={ref}
      className={`${inputBase} pr-8 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%236B7284%27%20stroke-width%3D%272.5%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_12px_center] ${className}`}
      {...rest}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...rest }, ref) => (
    <textarea
      ref={ref}
      className={`w-full min-h-[80px] rounded-sm border border-ink-300 bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 ${className}`}
      {...rest}
    />
  ),
);
Textarea.displayName = 'Textarea';

interface PrefixInputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefix: string;
}

export const PrefixInput = forwardRef<HTMLInputElement, PrefixInputProps>(
  ({ prefix, className = '', ...rest }, ref) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-500 pointer-events-none">
        {prefix}
      </span>
      <input ref={ref} className={`${inputBase} pl-10 ${className}`} {...rest} />
    </div>
  ),
);
PrefixInput.displayName = 'PrefixInput';
