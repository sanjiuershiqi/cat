import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, GitPullRequest, Search } from 'lucide-react'
import { githubRest } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'

type Pull = {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  user: { login: string; avatar_url: string }
  updated_at: string
  merged_at: string | null
  draft: boolean
}

export default function PullRequests() {
  const repo = useSettingsStore((s) => s.repo)
  const [items, setItems] = useState<Pull[] | null>(null)
  const [state, setState] = useState<'open' | 'closed' | 'all'>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    if (!items) return null
    const needle = q.trim().toLowerCase()
    if (!needle) return items
    return items.filter((p) => `${p.number} ${p.title} ${p.user.login}`.toLowerCase().includes(needle))
  }, [items, q])

  useEffect(() => {
    let canceled = false
    setItems(null)
    githubRest<Pull[]>(`/repos/${repo.owner}/${repo.repo}/pulls?state=${state}&per_page=30`)
      .then((data) => {
        if (canceled) return
        setItems(data)
      })
      .catch(() => {
        if (canceled) return
        setItems([])
      })
    return () => {
      canceled = true
    }
  }, [repo.owner, repo.repo, state])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <GitPullRequest className="h-[18px] w-[18px] text-pink-200" />
          </div>
          <div className="font-display text-[18px] tracking-[0.2px]">PR Tracker</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            <Filter className="h-4 w-4 text-white/55" />
            <button
              type="button"
              onClick={() => setState('all')}
              className={state === 'all' ? 'text-pink-100' : 'text-white/70 hover:text-white'}
            >
              all
            </button>
            <span className="text-white/25">/</span>
            <button
              type="button"
              onClick={() => setState('open')}
              className={state === 'open' ? 'text-pink-100' : 'text-white/70 hover:text-white'}
            >
              open
            </button>
            <span className="text-white/25">/</span>
            <button
              type="button"
              onClick={() => setState('closed')}
              className={state === 'closed' ? 'text-pink-100' : 'text-white/70 hover:text-white'}
            >
              closed
            </button>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Search className="h-4 w-4 text-white/55" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索标题 / 作者 / 编号"
              className="w-[220px] bg-transparent text-sm text-white/90 outline-none placeholder:text-white/35"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-2">
          {filtered
            ? filtered.map((pr) => (
                <Link
                  key={pr.id}
                  to={`/prs/${pr.number}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-white/90">
                        #{pr.number} {pr.title}
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        {pr.user.login} · {pr.merged_at ? 'merged' : pr.state}
                        {pr.draft ? ' · draft' : ''} · {new Date(pr.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
                      {pr.merged_at ? 'merged' : pr.state}
                    </span>
                  </div>
                </Link>
              ))
            : Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-[52px] animate-pulse rounded-xl border border-white/10 bg-white/5" />
              ))}
        </div>
      </div>
    </div>
  )
}
