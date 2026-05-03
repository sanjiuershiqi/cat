import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70', className)}>{children}</span>
}

export function BadgePink({ children }: { children: ReactNode }) {
  return <Badge className="border-pink-200/25 bg-pink-200/10 text-pink-100">{children}</Badge>
}

export function BadgeSky({ children }: { children: ReactNode }) {
  return <Badge className="border-sky-200/25 bg-sky-200/10 text-sky-100">{children}</Badge>
}

export function BadgeAmber({ children }: { children: ReactNode }) {
  return <Badge className="border-amber-200/25 bg-amber-200/10 text-amber-100">{children}</Badge>
}

