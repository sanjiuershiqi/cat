import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function IconButton({
  children,
  onClick,
  className,
  label,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35',
        className,
      )}
    >
      {children}
    </button>
  )
}

