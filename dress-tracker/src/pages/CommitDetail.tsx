import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUpRight, FileDiff, GitCommitHorizontal } from 'lucide-react'
import { githubRest, githubRestText } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import Lightbox from '@/components/Lightbox'
import DiffViewer from '@/components/DiffViewer'

type CommitFile = {
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
  patch?: string
  raw_url?: string
  blob_url?: string
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
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [diff, setDiff] = useState<string | null>(null)
  const [diffLoading, setDiffLoading] = useState(false)
  const [activeImage, setActiveImage] = useState<{ src: string; title: string } | null>(null)

  const isImagePath = useMemo(() => {
    return (path: string) => {
      const lower = path.toLowerCase()
      return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp')
    }
  }, [])

  const title = useMemo(() => (data ? data.commit.message.split('\n')[0] : sha.slice(0, 7)), [data, sha])

  useEffect(() => {
    if (!sha) return
    let canceled = false
    setError(null)
    setData(null)
    setSelectedFile(null)

    githubRest<CommitResponse>(`/repos/${repo.owner}/${repo.repo}/commits/${sha}`)
      .then((d) => {
        if (canceled) return
        setData(d)
        setSelectedFile((prev) => prev || (d.files?.length ? d.files[0].filename : null))
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
        <div className="mt-3 grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="grid max-h-[520px] gap-2 overflow-auto pr-1 [content-visibility:auto]">
            {data?.files
              ? data.files.map((f) => {
                  const active = selectedFile === f.filename
                  return (
                    <button
                      key={f.filename}
                      type="button"
                      onClick={() => setSelectedFile(f.filename)}
                      className={[
                        'rounded-2xl border px-3 py-2 text-left text-sm transition',
                        active
                          ? 'border-sky-200/30 bg-sky-200/10 text-sky-50'
                          : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm text-white/90">{f.filename}</div>
                          <div className="mt-1 text-xs text-white/55">
                            {f.status} · +{f.additions} / -{f.deletions} · {f.changes}
                          </div>
                        </div>
                        <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
                          diff
                        </div>
                      </div>
                    </button>
                  )
                })
              : Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[56px] animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-black/40 p-3">
            {data?.files && selectedFile ? (
              (() => {
                const f = data.files?.find((x) => x.filename === selectedFile)
                if (!f) return null
                if (f.patch) {
                  return <DiffViewer value={f.patch} />
                }

                const previewable = !!f.raw_url && isImagePath(f.filename)

                return (
                  <div className="space-y-3">
                    <div className="text-sm text-white/70">
                      Binary file diff（或 diff 太大）：GitHub 未返回 patch。可用上方 Load unified diff 获取完整 diff。
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {f.blob_url ? (
                        <a
                          href={f.blob_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
                        >
                          GitHub
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      ) : null}
                      {f.raw_url ? (
                        <a
                          href={f.raw_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
                        >
                          Raw
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                    {previewable ? (
                      <button
                        type="button"
                        className="w-fit rounded-2xl border border-white/10 bg-white/5 p-1 transition hover:bg-white/10"
                        onClick={() => setActiveImage({ src: f.raw_url!, title: f.filename })}
                      >
                        <img src={f.raw_url!} alt={f.filename} className="max-h-[420px] max-w-full rounded-[14px] object-contain" />
                      </button>
                    ) : (
                      <div className="text-xs text-white/55">该文件为二进制或不可预览格式。</div>
                    )}
                  </div>
                )
              })()
            ) : (
              <div className="grid h-[320px] place-items-center text-sm text-white/55">选择一个文件查看 diff</div>
            )}
          </div>
        </div>
        {diff ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="mb-2 text-xs text-white/55">Unified diff</div>
            <DiffViewer value={diff} />
          </div>
        ) : null}
        </CardContent>
      </Card>
      {activeImage ? (
        <Lightbox
          open
          src={activeImage.src}
          title={activeImage.title}
          subtitle={`${repo.owner}/${repo.repo}`}
          onClose={() => setActiveImage(null)}
        />
      ) : null}
    </div>
  )
}
