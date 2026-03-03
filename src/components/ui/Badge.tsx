import { clsx } from 'clsx'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'

interface BadgeProps {
  variant?:  BadgeVariant
  children:  React.ReactNode
  className?: string
  dot?:       boolean
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-blue-500/10  text-blue-400  border-blue-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10  text-amber-400   border-amber-500/20',
  danger:  'bg-red-500/10    text-red-400     border-red-500/20',
  info:    'bg-sky-500/10    text-sky-400     border-sky-500/20',
  muted:   'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-blue-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger:  'bg-red-400',
  info:    'bg-sky-400',
  muted:   'bg-[var(--text-muted)]',
}

export function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2 py-0.5',
      'text-xs font-medium rounded border',
      'font-["IBM_Plex_Mono"]',
      variants[variant],
      className,
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  )
}
