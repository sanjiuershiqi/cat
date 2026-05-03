import { Activity, BarChart3 } from 'lucide-react'

export default function Stats() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
          <BarChart3 className="h-[18px] w-[18px] text-sky-200" />
        </div>
        <div className="font-display text-[18px] tracking-[0.2px]">Stats</div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card title="PR trend" />
        <Card title="Commit pulse" />
        <Card title="Contributors" />
      </div>
    </div>
  )
}

function Card({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="font-display text-[14px] tracking-[0.18px]">{title}</div>
        <Activity className="h-4 w-4 text-white/40" />
      </div>
      <div className="mt-3 h-[160px] rounded-2xl border border-white/10 bg-white/5" />
      <div className="mt-3 text-xs text-white/55">统计看板会在下一步接入（聚合 API + 缓存）。</div>
    </div>
  )
}

