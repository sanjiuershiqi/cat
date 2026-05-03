import { KeyRound, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export default function SettingsPage() {
  const token = useSettingsStore((s) => s.githubToken)
  const setToken = useSettingsStore((s) => s.setGithubToken)
  const [value, setValue] = useState(token)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
          <ShieldCheck className="h-[18px] w-[18px] text-emerald-200" />
        </div>
        <div className="font-display text-[18px] tracking-[0.2px]">Settings</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <KeyRound className="h-[18px] w-[18px] text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[14px] tracking-[0.18px]">GitHub Token（可选）</div>
            <div className="mt-0.5 text-xs text-white/60">仅保存在浏览器本地，用于提高 API 额度；不写入服务器存储。</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ghp_... 或 fine-grained token"
            className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-amber-200/35"
          />
          <button
            type="button"
            className="h-11 rounded-xl border border-amber-200/25 bg-amber-200/10 px-4 text-sm text-amber-100 transition hover:bg-amber-200/15"
            onClick={() => setToken(value.trim())}
          >
            保存
          </button>
          <button
            type="button"
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/80 transition hover:bg-white/10"
            onClick={() => {
              setValue('')
              setToken('')
            }}
          >
            清除
          </button>
        </div>
      </div>
    </div>
  )
}

