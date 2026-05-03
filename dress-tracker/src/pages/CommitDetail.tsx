import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUpRight, GitCommitHorizontal } from 'lucide-react'
import { githubRest } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'

type CommitFile = {
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
  patch?: string
}

type CommitResponse = {
  sha: string
  html_url: string
  commit: {
    message: string
    author: { name: string; date: string }
    committer: { name: string; date: string }
  }
  author: { login: string; avatar_url: string } | null
  files?: CommitFile[]
}

export default function CommitDetail() {
  const repo = useSettingsStore((s) => s.repo)
  const params = useParams()
  const sha = String(params.sha || '')

  const [data, setData] = useState<CommitResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const title = useMemo(() => (data ? data.commit.message.split('\n')[0] : sha.slice(0, 7)), [data, sha])

  useEffect(() => {
    if (!sha) return
    let canceled = false
    setError(null)
    setData(null)
    setExpanded(null)

    githubRest<CommitResponse>(`/repos/${repo.owner}/${repo.repo}/commits/${sha}`)
      .then((d) => {
        if (canceled) return
        setData(d)
      })
      .catch((e) => {
        if (canceled) return
        setError(e instanceof Error ? e.message : '加载失败')
      })

    return () => {
      canceled = true
    }
  }, [repo.owner, repo.repo, sha])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <GitCommitHorizontal className="h-[18px] w-[18px] text-sky-200" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-[18px] tracking-[0.2px]">{title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/55">
              <span className="truncate">{data?.author?.login || data?.commit.author.name || '—'}</span>
              <span className="font-mono text-[11px] text-white/45">{sha.slice(0, 10)}</span>
              <span>{data ? new Date(data.commit.author.date).toLocaleString() : '加载中…'}</span>
            </div>
          </div>
        </div>

        {data ? (
          <a
            href={data.html_url}
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="font-display text-[14px] tracking-[0.18px]">Files</div>
        <div className="mt-3 grid gap-2">
          {data?.files
            ? data.files.map((f) => {
                const open = expanded === f.filename
                return (
                  <div key={f.filename} className="rounded-2xl border border-white/10 bg-white/5">
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left"
                      onClick={() => setExpanded(open ? null : f.filename)}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-white/90">{f.filename}</div>
                        <div className="mt-1 text-xs text-white/55">
                          {f.status} · +{f.additions} / -{f.deletions} · {f.changes} changes
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
                        {open ? 'hide' : 'diff'}
                      </div>
                    </button>
                    {open ? (
                      <div className="border-t border-white/10 p-3">
                        {f.patch ? (
                          <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 text-[12px] leading-5 text-white/80">
                            {f.patch}
                          </pre>
                        ) : (
                          <div className="text-sm text-white/55">该文件 diff 太大或不可用（GitHub 未返回 patch）。</div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })
            : Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[56px] animate-pulse rounded-2xl border border-white/10 bg-white/5" />
              ))}
        </div>
      </div>
    </div>
  )
}

