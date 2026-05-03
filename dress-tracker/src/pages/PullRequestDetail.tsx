import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowUpRight, FileDiff, GitPullRequest, MessageSquareText } from 'lucide-react'
import { githubRest, githubRestText } from '@/lib/githubApi'
import Markdown from '@/components/Markdown'
import { useSettingsStore } from '@/store/settingsStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import Lightbox from '@/components/Lightbox'

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

type PullFile = {
  sha: string
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
  patch?: string
  raw_url?: string
  blob_url?: string
}

function isImagePath(path: string) {
  const lower = path.toLowerCase()
  return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp')
}

export default function PullRequestDetail() {
  const repo = useSettingsStore((s) => s.repo)
  const params = useParams()
  const number = Number(params.number)

  const [pr, setPr] = useState<Pull | null>(null)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [files, setFiles] = useState<PullFile[] | null>(null)
  const [filesPage, setFilesPage] = useState(1)
  const [filesHasMore, setFilesHasMore] = useState(true)
  const [filesLoadingMore, setFilesLoadingMore] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fullDiff, setFullDiff] = useState<string | null>(null)
  const [fullDiffLoading, setFullDiffLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<{ src: string; title: string } | null>(null)

  const title = useMemo(() => (pr ? `#${pr.number} ${pr.title}` : `#${number}`), [pr, number])

  useEffect(() => {
    if (!Number.isFinite(number) || number <= 0) return
    let canceled = false
    setError(null)
    setPr(null)
    setComments(null)
    setFiles(null)
    setSelectedFile(null)
    setFilesPage(1)
    setFilesHasMore(true)
    setFullDiff(null)

    Promise.all([
      githubRest<Pull>(`/repos/${repo.owner}/${repo.repo}/pulls/${number}`),
      githubRest<Comment[]>(`/repos/${repo.owner}/${repo.repo}/issues/${number}/comments?per_page=30`),
      githubRest<PullFile[]>(`/repos/${repo.owner}/${repo.repo}/pulls/${number}/files?per_page=30&page=1`),
    ])
      .then(([p, c, f]) => {
        if (canceled) return
        setPr(p)
        setComments(c)
        setFiles(f)
        setFilesHasMore(f.length === 30)
        setSelectedFile((prev) => prev || (f.length ? f[0].filename : null))
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
      <PageHeader
        icon={<GitPullRequest className="h-[18px] w-[18px] text-pink-200" />}
        title="Pull request"
        subtitle={pr ? `${title} · ${pr.user.login} · ${pr.merged_at ? 'merged' : pr.state} · ${new Date(pr.updated_at).toLocaleString()}` : `${title} · 加载中…`}
        actions={
          pr ? (
            <a
              href={pr.html_url}
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardContent>
              <div className="font-display text-[14px] tracking-[0.18px]">Description</div>
              <div className="mt-2">
                {pr ? <Markdown value={pr.body || '—'} /> : <div className="h-[160px] animate-pulse rounded-2xl border border-white/10 bg-white/5" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <FileDiff className="h-[18px] w-[18px] text-sky-200" />
                </div>
                <div className="font-display text-[14px] tracking-[0.18px]">Files changed</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-white/55">{files ? files.length : '—'}</div>
                <button
                  type="button"
                  disabled={!pr || fullDiffLoading}
                  className={[
                    'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition',
                    pr && !fullDiffLoading
                      ? 'border-sky-200/20 bg-sky-200/10 text-sky-100 hover:bg-sky-200/15'
                      : 'border-white/10 bg-white/5 text-white/35',
                  ].join(' ')}
                  onClick={async () => {
                    if (!pr || fullDiffLoading) return
                    setFullDiffLoading(true)
                    try {
                      const text = await githubRestText(`/repos/${repo.owner}/${repo.repo}/pulls/${number}`, {
                        accept: 'application/vnd.github.v3.diff',
                      })
                      setFullDiff(text)
                    } finally {
                      setFullDiffLoading(false)
                    }
                  }}
                >
                  <FileDiff className="h-4 w-4" />
                  {fullDiffLoading ? 'Loading…' : fullDiff ? 'Unified diff' : 'Load unified diff'}
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="grid max-h-[520px] gap-2 overflow-auto pr-1 [content-visibility:auto]">
                {files
                  ? files.map((f) => {
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
                              <div className="truncate text-white/90">{f.filename}</div>
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
                {files && selectedFile ? (
                  (() => {
                    const f = files.find((x) => x.filename === selectedFile)
                    if (!f) return null
                    if (f.patch) {
                      return (
                        <pre className="max-h-[520px] overflow-auto text-[12px] leading-5 text-white/80">{f.patch}</pre>
                      )
                    }

                    const previewable = !!f.raw_url && isImagePath(f.filename)

                    return (
                      <div className="space-y-3">
                        <div className="text-sm text-white/70">
                          Binary file diff（或 diff 太大）：GitHub 未返回 patch。
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

            {files && filesHasMore ? (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={filesLoadingMore}
                  className={[
                    'h-10 rounded-xl border px-4 text-sm transition',
                    !filesLoadingMore ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10' : 'border-white/10 bg-white/5 text-white/35',
                  ].join(' ')}
                  onClick={async () => {
                    if (filesLoadingMore) return
                    setFilesLoadingMore(true)
                    try {
                      const nextPage = filesPage + 1
                      const next = await githubRest<PullFile[]>(
                        `/repos/${repo.owner}/${repo.repo}/pulls/${number}/files?per_page=30&page=${nextPage}`,
                      )
                      setFiles((prev) => (prev ? [...prev, ...next] : next))
                      setFilesPage(nextPage)
                      setFilesHasMore(next.length === 30)
                    } finally {
                      setFilesLoadingMore(false)
                    }
                  }}
                >
                  {filesLoadingMore ? 'Loading…' : 'Load more files'}
                </button>
              </div>
            ) : null}

            {fullDiff ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="mb-2 text-xs text-white/55">Unified diff</div>
                <pre className="max-h-[520px] overflow-auto text-[12px] leading-5 text-white/80">{fullDiff}</pre>
              </div>
            ) : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
          <div className="flex items-center justify-between">
            <div className="font-display text-[14px] tracking-[0.18px]">Timeline</div>
            <div className="text-xs text-white/55">{comments ? comments.length : '—'}</div>
          </div>
          <div className="mt-3 grid max-h-[520px] gap-2 overflow-auto pr-1">
            {comments
              ? comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-xs text-white/60">{c.user.login}</div>
                      <div className="shrink-0 text-[11px] text-white/45">{new Date(c.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2">
                      <Markdown value={c.body} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-white/45">comment</div>
                      <a
                        href={c.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
                      >
                        GitHub
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[120px] animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
            <MessageSquareText className="h-4 w-4 text-white/45" />
            评论图片与附件在 Markdown 内直接预览
          </div>
          </CardContent>
        </Card>
      </div>
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
