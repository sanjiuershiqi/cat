import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUpRight, GitPullRequest, MessageSquareText } from 'lucide-react'
import { githubRest } from '@/lib/githubApi'
import Markdown from '@/components/Markdown'
import { useSettingsStore } from '@/store/settingsStore'

type Pull = {
  number: number
  title: string
  body: string | null
  state: string
  html_url: string
  user: { login: string; avatar_url: string }
  created_at: string
  updated_at: string
  merged_at: string | null
}

type Comment = {
  id: number
  body: string
  html_url: string
  user: { login: string; avatar_url: string }
  created_at: string
}

export default function PullRequestDetail() {
  const repo = useSettingsStore((s) => s.repo)
  const params = useParams()
  const number = Number(params.number)

  const [pr, setPr] = useState<Pull | null>(null)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => (pr ? `#${pr.number} ${pr.title}` : `#${number}`), [pr, number])

  useEffect(() => {
    if (!Number.isFinite(number) || number <= 0) return
    let canceled = false
    setError(null)
    setPr(null)
    setComments(null)

    Promise.all([
      githubRest<Pull>(`/repos/${repo.owner}/${repo.repo}/pulls/${number}`),
      githubRest<Comment[]>(`/repos/${repo.owner}/${repo.repo}/issues/${number}/comments?per_page=30`),
    ])
      .then(([p, c]) => {
        if (canceled) return
        setPr(p)
        setComments(c)
      })
      .catch((e) => {
        if (canceled) return
        setError(e instanceof Error ? e.message : '加载失败')
      })

    return () => {
      canceled = true
    }
  }, [repo.owner, repo.repo, number])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <GitPullRequest className="h-[18px] w-[18px] text-pink-200" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-[18px] tracking-[0.2px]">{title}</div>
            <div className="mt-1 text-xs text-white/55">
              {pr
                ? `${pr.user.login} · ${pr.merged_at ? 'merged' : pr.state} · ${new Date(pr.updated_at).toLocaleString()}`
                : '加载中…'}
            </div>
          </div>
        </div>

        {pr ? (
          <a
            href={pr.html_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
          >
            GitHub
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200/20 bg-rose-200/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-display text-[14px] tracking-[0.18px]">Description</div>
          <div className="mt-2">
            {pr ? <Markdown value={pr.body || '—'} /> : <div className="h-[160px] animate-pulse rounded-2xl border border-white/10 bg-white/5" />}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-[14px] tracking-[0.18px]">Timeline</div>
            <div className="text-xs text-white/55">{comments ? comments.length : '—'}</div>
          </div>
          <div className="mt-3 grid max-h-[520px] gap-2 overflow-auto pr-1">
            {comments
              ? comments.map((c) => (
                  <a
                    key={c.id}
                    href={c.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-xs text-white/60">{c.user.login}</div>
                      <div className="shrink-0 text-[11px] text-white/45">{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2">
                      <Markdown value={c.body} />
                    </div>
                  </a>
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[120px] animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
            <MessageSquareText className="h-4 w-4 text-white/45" />
            评论图片与附件在 Markdown 内直接预览
          </div>
        </div>
      </div>
    </div>
  )
}

