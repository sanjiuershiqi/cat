import { Minus, Plus, RotateCcw, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type LightboxProps = {
  open: boolean
  src: string
  title: string
  subtitle?: string
  onClose: () => void
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export default function Lightbox({ open, src, title, subtitle, onClose }: LightboxProps) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const pointer = useRef<{ id: number; x: number; y: number; baseX: number; baseY: number } | null>(null)

  const canPan = scale > 1.02

  const reset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (!open) return
    reset()
  }, [open, src])

  const toolbar = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          onClick={() => setScale((s) => clamp(Number((s - 0.2).toFixed(2)), 1, 5))}
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          onClick={() => setScale((s) => clamp(Number((s + 0.2).toFixed(2)), 1, 5))}
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          onClick={reset}
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    [onClose],
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 p-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="mx-auto flex h-full max-w-[1400px] flex-col">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e0f13]/90 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate font-display text-[14px] tracking-[0.18px]">{title}</div>
            {subtitle ? <div className="mt-0.5 truncate text-xs text-white/60">{subtitle}</div> : null}
          </div>
          {toolbar}
        </div>

        <div
          className="mt-4 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40"
          style={{ touchAction: 'none' }}
          onWheel={(e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.15 : 0.15
            setScale((s) => clamp(Number((s + delta).toFixed(2)), 1, 5))
          }}
          onPointerDown={(e) => {
            if (!canPan) return
            pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, baseX: offset.x, baseY: offset.y }
            ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!pointer.current) return
            if (pointer.current.id !== e.pointerId) return
            const dx = e.clientX - pointer.current.x
            const dy = e.clientY - pointer.current.y
            setOffset({ x: pointer.current.baseX + dx, y: pointer.current.baseY + dy })
          }}
          onPointerUp={(e) => {
            if (!pointer.current) return
            if (pointer.current.id !== e.pointerId) return
            pointer.current = null
          }}
          onPointerCancel={() => {
            pointer.current = null
          }}
        >
          <div className="grid h-full w-full place-items-center">
            <img
              src={src}
              alt={title}
              className="max-h-full max-w-full select-none object-contain"
              draggable={false}
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
                transition: pointer.current ? 'none' : 'transform 120ms ease',
                cursor: canPan ? 'grab' : 'default',
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-white/55">
          <div>Scroll to zoom · drag to pan</div>
          <div>{Math.round(scale * 100)}%</div>
        </div>
      </div>
    </div>
  )
}

