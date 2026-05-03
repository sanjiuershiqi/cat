import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { Filter, GitPullRequest, Search } from 'lucide-react'
import { githubRest } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

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

export default function PullRequestsLayout() {
  const repo = useSettingsStore((s) => s.repo)
  const params = useParams()
  const selected = params.number ? Number(params.number) : null

  const [items, setItems] = useState<Pull[] | null>(null)
  const [state, setState] = useState<'open' | 'closed' | 'all'>('all')
  const [q, setQ] = useState('')
  const deferredQ = useDeferredValue(q)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const filtered = useMemo(() => {
    if (!items) return null
    const needle = deferredQ.trim().toLowerCase()
    if (!needle) return items
    return items.filter((p) => `${p.number} ${p.title} ${p.user.login}`.toLowerCase().includes(needle))
  }, [items, deferredQ])

  useEffect(() => {
    let canceled = false
    setItems(null)
    setPage(1)
    setHasMore(true)

    githubRest<Pull[]>(`/repos/${repo.owner}/${repo.repo}/pulls?state=${state}&per_page=30&page=1`)
      .then((data) => {
        if (canceled) return
        setItems(data)
        setHasMore(data.length === 30)
      })
      .catch(() => {
        if (canceled) return
        setItems([])
        setHasMore(false)
      })

    return () => {
      canceled = true
    }
  }, [repo.owner, repo.repo, state])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const next = await githubRest<Pull[]>(`/repos/${repo.owner}/${repo.repo}/pulls?state=${state}&per_page=30&page=${nextPage}`)
      setItems((prev) => (prev ? [...prev, ...next] : next))
      setPage(nextPage)
      setHasMore(next.length === 30)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loadingMore, page, repo.owner, repo.repo, state])

  const hasSelection = selected != null && Number.isFinite(selected)

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<GitPullRequest className="h-[18px] w-[18px] text-pink-200" />}
        title="PR Tracker"
        subtitle="左侧列表 · 右侧详情（不跳转 GitHub）"
        actions={
          <>
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
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className={cn('overflow-hidden', hasSelection ? 'hidden lg:block' : '')}>
          <CardContent className="pt-3">
            <div className="grid max-h-[70vh] gap-2 overflow-auto pr-1 [content-visibility:auto]">
              {filtered
                ? filtered.map((pr) => {
                    const active = selected === pr.number
                    return (
                      <Link
                        key={pr.id}
                        to={`${pr.number}`}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-sm transition',
                          active
                            ? 'border-pink-200/30 bg-pink-200/10 text-pink-50'
                            : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate">
                              #{pr.number} {pr.title}
                            </div>
                            <div className="mt-1 text-xs text-white/55">
                              {pr.user.login} · {pr.merged_at ? 'merged' : pr.state}
                              {pr.draft ? ' · draft' : ''} · {new Date(pr.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge
                            className={
                              pr.merged_at
                                ? 'border-emerald-200/20 bg-emerald-200/10 text-emerald-100'
                                : pr.state === 'open'
                                  ? 'border-pink-200/25 bg-pink-200/10 text-pink-100'
                                  : ''
                            }
                          >
                            {pr.merged_at ? 'merged' : pr.state}
                          </Badge>
                        </div>
                      </Link>
                    )
                  })
                : Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="h-[52px] animate-pulse rounded-xl border border-white/10 bg-white/5" />
                  ))}
            </div>

            {items && q.trim() === '' ? (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={!hasMore || loadingMore}
                  className={[
                    'h-10 rounded-xl border px-4 text-sm transition',
                    hasMore && !loadingMore
                      ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                      : 'border-white/10 bg-white/5 text-white/35',
                  ].join(' ')}
                  onClick={loadMore}
                >
                  {loadingMore ? 'Loading…' : hasMore ? 'Load more' : 'No more'}
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
