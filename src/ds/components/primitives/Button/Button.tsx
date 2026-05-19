import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/cn';

/**
 * Nexti Button — primary interactive element.
 *
 * Variants:
 * - primary    → orange brand CTA (one per screen)
 * - secondary  → navy filled, supporting actions
 * - outline    → border + transparent bg, tertiary
 * - ghost      → no border, hover bg only
 * - danger     → destructive actions
 *
 * Sizes: sm | md (default) | lg
 *
 * Behavior:
 * - `asChild` polymorphism via Radix Slot (use as <Link> wrapper)
 * - `loading` shows spinner, disables click
 * - Icons via `leftIcon`/`rightIcon` props (Lucide components)
 *
 * A11y:
 * - `disabled` and `loading` both apply aria-disabled
 * - Focus ring visible (focus-visible only)
 *
 * Reference: reference-html/Component - Button.html
 */
const buttonStyles = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-bold whitespace-nowrap select-none',
    'rounded-[6px] transition-colors duration-fast ease-nx',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
    'disabled:cursor-not-allowed disabled:opacity-50',
    "[&>svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-orange-500 text-white shadow-sm',
          'hover:bg-orange-600 active:bg-orange-700',
        ],
        secondary: [
          'bg-navy-700 text-white',
          'hover:bg-navy-800 active:bg-navy-900',
        ],
        outline: [
          'border border-ink-300 bg-white text-navy-700',
          'hover:bg-ink-50 hover:border-ink-400',
          'active:bg-ink-100',
        ],
        ghost: [
          'bg-transparent text-navy-700',
          'hover:bg-ink-100 active:bg-ink-200',
        ],
        danger: [
          'bg-danger text-white shadow-sm',
          'hover:brightness-95 active:brightness-90',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  /** Render as child element (e.g. <a>, <Link>). */
  asChild?: boolean;
  /** Show loading spinner; disables click. */
  loading?: boolean;
  /** Icon shown before label. */
  leftIcon?: React.ReactNode;
  /** Icon shown after label. */
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, block, asChild, loading, leftIcon, rightIcon, disabled, children, ...rest },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    return (
      <Comp
        ref={ref}
        className={cn(buttonStyles({ variant, size, block }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...rest}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
