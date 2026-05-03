import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUpRight, FileDiff, GitCommitHorizontal } from 'lucide-react'
import { githubRest, githubRestText } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'

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
  const [diff, setDiff] = useState<string | null>(null)
  const [diffLoading, setDiffLoading] = useState(false)

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
      <PageHeader
        icon={<GitCommitHorizontal className="h-[18px] w-[18px] text-sky-200" />}
        title="Commit"
        subtitle={data ? `${data.author?.login || data.commit.author.name} · ${sha.slice(0, 10)} · ${new Date(data.commit.author.date).toLocaleString()}` : `${sha.slice(0, 10)} · 加载中…`}
        actions={
          data ? (
            <a
              href={data.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
            >
              GitHub
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200/20 bg-rose-200/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}

      <Card>
        <CardContent>
        <div className="flex items-center justify-between gap-3">
          <div className="font-display text-[14px] tracking-[0.18px]">Files</div>
          <button
            type="button"
            disabled={!data || diffLoading}
            className={[
              'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition',
              data && !diffLoading
                ? 'border-sky-200/20 bg-sky-200/10 text-sky-100 hover:bg-sky-200/15'
                : 'border-white/10 bg-white/5 text-white/35',
            ].join(' ')}
            onClick={async () => {
              if (!data || diffLoading) return
              setDiffLoading(true)
              try {
                const text = await githubRestText(`/repos/${repo.owner}/${repo.repo}/commits/${sha}`, {
                  accept: 'application/vnd.github.v3.diff',
                })
                setDiff(text)
              } finally {
                setDiffLoading(false)
              }
            }}
          >
            <FileDiff className="h-4 w-4" />
            {diffLoading ? 'Loading…' : diff ? 'Unified diff' : 'Load unified diff'}
          </button>
        </div>
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
                          <div className="text-sm text-white/55">
                            该文件 diff 太大或不可用（GitHub 未返回 patch）。可用上方 Load unified diff 获取完整 diff。
                          </div>
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
        {diff ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="mb-2 text-xs text-white/55">Unified diff</div>
            <pre className="max-h-[520px] overflow-auto text-[12px] leading-5 text-white/80">{diff}</pre>
          </div>
        ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
