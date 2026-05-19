import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...rest }, ref) => (
    <input
      ref={ref}
      className={`h-10 w-full rounded-sm border border-ink-300 bg-white px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 ${className}`}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
