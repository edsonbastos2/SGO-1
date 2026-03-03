import { clsx } from 'clsx'

interface CardProps {
  children:   React.ReactNode
  className?: string
  padding?:   'sm' | 'md' | 'lg' | 'none'
  bordered?:  boolean
  hoverable?: boolean
}

const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' }

export function Card({ children, className, padding = 'md', bordered = true, hoverable }: CardProps) {
  return (
    <div className={clsx(
      'bg-[var(--bg-surface)] rounded-lg',
      bordered && 'border border-[var(--border)]',
      hoverable && 'hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] transition-colors duration-150 cursor-pointer',
      paddings[padding],
      className,
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title:      string
  subtitle?:  string
  action?:    React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function CardDivider() {
  return <div className="border-t border-[var(--border)] my-4" />
}
