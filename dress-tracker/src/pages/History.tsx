import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileClock, Search } from 'lucide-react'
import { githubRest } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type Commit = {
  sha: string
  html_url: string
  commit: { message: string; author: { name: string; date: string } }
  author: { login: string; avatar_url: string } | null
}

export default function History() {
  const repo = useSettingsStore((s) => s.repo)
  const [items, setItems] = useState<Commit[] | null>(null)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    if (!items) return null
    const needle = q.trim().toLowerCase()
    if (!needle) return items
    return items.filter((c) => `${c.sha} ${c.commit.message} ${(c.author?.login || c.commit.author.name)}`.toLowerCase().includes(needle))
  }, [items, q])

  useEffect(() => {
    let canceled = false
    setItems(null)
    setPage(1)
    setHasMore(true)
    githubRest<Commit[]>(`/repos/${repo.owner}/${repo.repo}/commits?per_page=30&page=1`)
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
  }, [repo.owner, repo.repo])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={<FileClock className="h-[18px] w-[18px] text-amber-200" />}
        title="History"
        subtitle="站内提交浏览：commit → 文件变更 → diff（支持统一 diff）"
        actions={
          <div className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Search className="h-4 w-4 text-white/55" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索 commit message / author / sha"
              className="w-[260px] bg-transparent text-sm text-white/90 outline-none placeholder:text-white/35"
            />
          </div>
        }
      />

      <Card>
        <CardContent className="pt-3">
        <div className="grid gap-2">
          {filtered
            ? filtered.map((c) => (
                <Link
                  key={c.sha}
                  to={`/commit/${c.sha}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-white/90">{c.commit.message.split('\n')[0]}</div>
                      <div className="mt-1 text-xs text-white/55">
                        {c.author?.login || c.commit.author.name} · {new Date(c.commit.author.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className="font-mono text-[11px] text-white/65">{c.sha.slice(0, 7)}</Badge>
                  </div>
                </Link>
              ))
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
              onClick={async () => {
                if (!hasMore || loadingMore) return
                setLoadingMore(true)
                try {
                  const nextPage = page + 1
                  const next = await githubRest<Commit[]>(
                    `/repos/${repo.owner}/${repo.repo}/commits?per_page=30&page=${nextPage}`,
                  )
                  setItems((prev) => (prev ? [...prev, ...next] : next))
                  setPage(nextPage)
                  setHasMore(next.length === 30)
                } finally {
                  setLoadingMore(false)
                }
              }}
            >
              {loadingMore ? 'Loading…' : hasMore ? 'Load more' : 'No more'}
            </button>
          </div>
        ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
