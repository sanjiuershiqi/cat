import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({
  icon,
  title,
  subtitle,
  actions,
  className,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">{icon}</div>
        <div className="min-w-0">
          <div className="font-display text-[18px] tracking-[0.2px]">{title}</div>
          {subtitle ? <div className="mt-0.5 text-xs text-white/60">{subtitle}</div> : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

