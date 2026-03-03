import { clsx } from 'clsx'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant:    AlertVariant
  title?:     string
  message:    string
  onClose?:   () => void
  className?: string
}

const config: Record<AlertVariant, { icon: React.ElementType; classes: string }> = {
  info:    { icon: Info,          classes: 'bg-blue-500/8  border-blue-500/25   text-blue-300' },
  success: { icon: CheckCircle2,  classes: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-300' },
  warning: { icon: AlertTriangle, classes: 'bg-amber-500/8  border-amber-500/25  text-amber-300' },
  error:   { icon: AlertCircle,   classes: 'bg-red-500/8    border-red-500/25    text-red-300' },
}

export function Alert({ variant, title, message, onClose, className }: AlertProps) {
  const { icon: Icon, classes } = config[variant]

  return (
    <div className={clsx(
      'flex gap-3 p-3.5 rounded-lg border text-sm animate-fade-in',
      classes,
      className,
    )}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="opacity-90 leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
