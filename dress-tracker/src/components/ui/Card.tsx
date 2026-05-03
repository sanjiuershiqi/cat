import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-white/10 bg-white/5 shadow-[0_34px_120px_rgba(0,0,0,0.55)]', className)}>{children}</div>
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('font-display text-[14px] tracking-[0.18px] text-white/95', className)}>{children}</div>
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-1 text-xs text-white/60', className)}>{children}</div>
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-4 py-4', className)}>{children}</div>
}

