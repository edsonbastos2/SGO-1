'use client'
import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  hint?:    string
  prefixIcon?:  React.ReactNode
  suffixIcon?:  React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefixIcon, suffixIcon, className, type, id, ...props }, ref) => {
    const [showPwd, setShowPwd] = useState(false)
    const inputId    = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const isPassword = type === 'password'
    const inputType  = isPassword ? (showPwd ? 'text' : 'password') : type

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-widest font-['IBM_Plex_Mono']"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center group">
          {/* Borda com glow no focus */}
          <div className={clsx(
            'absolute inset-0 rounded-md pointer-events-none',
            'border transition-all duration-200',
            error
              ? 'border-red-500/60 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
              : 'border-[var(--border)] group-focus-within:border-blue-500/70 group-focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]',
          )} />

          {prefixIcon && (
            <div className="absolute left-3 text-[var(--text-muted)] z-10 flex items-center">
              {prefixIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={clsx(
              'w-full bg-[var(--bg-elevated)] rounded-md',
              'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'h-10 transition-colors duration-150',
              'font-["IBM_Plex_Sans"]',
              'focus:outline-none',
              prefixIcon  ? 'pl-9'  : 'pl-3',
              (suffixIcon || isPassword) ? 'pr-10' : 'pr-3',
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors z-10"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}

          {suffixIcon && !isPassword && (
            <div className="absolute right-3 text-[var(--text-muted)] z-10 flex items-center">
              {suffixIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 animate-fade-in">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
