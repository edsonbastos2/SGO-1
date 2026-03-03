'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant
  size?:     Size
  loading?:  boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:   'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 hover:border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_28px_rgba(59,130,246,0.35)]',
  secondary: 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--accent)]',
  ghost:     'bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent',
  danger:    'bg-[var(--danger-dim)] hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/60',
}

const sizes: Record<Size, string> = {
  sm: 'h-8  px-3 text-xs  gap-1.5',
  md: 'h-10 px-4 text-sm  gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-md',
          'transition-all duration-150 ease-out',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2',
          'active:scale-[0.98]',
          'font-["IBM_Plex_Sans"]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={size} />
            <span>{children}</span>
          </>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

function Spinner({ size }: { size: Size }) {
  const s = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <svg className={clsx(s, 'animate-spin')} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
