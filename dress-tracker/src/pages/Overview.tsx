import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, GitCommitHorizontal, GitPullRequest, Image } from 'lucide-react'
import { githubRest } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'

type RepoResponse = {
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  default_branch: string
  updated_at: string
  owner: { avatar_url: string; login: string }
}

type Pull = {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  user: { login: string; avatar_url: string }
  updated_at: string
  merged_at: string | null
}

type Commit = {
  sha: string
  html_url: string
  commit: { message: string; author: { name: string; date: string } }
  author: { login: string; avatar_url: string } | null
}

export default function Overview() {
  const repo = useSettingsStore((s) => s.repo)

  const [repoInfo, setRepoInfo] = useState<RepoResponse | null>(null)
  const [prs, setPrs] = useState<Pull[] | null>(null)
  const [commits, setCommits] = useState<Commit[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => `${repo.owner}/${repo.repo}`, [repo.owner, repo.repo])

  useEffect(() => {
    let canceled = false
    setError(null)
    setRepoInfo(null)
    setPrs(null)
    setCommits(null)

    Promise.all([
      githubRest<RepoResponse>(`/repos/${repo.owner}/${repo.repo}`),
      githubRest<Pull[]>(`/repos/${repo.owner}/${repo.repo}/pulls?state=all&per_page=8`),
      githubRest<Commit[]>(`/repos/${repo.owner}/${repo.repo}/commits?per_page=8`),
    ])
      .then(([r, p, c]) => {
        if (canceled) return
        setRepoInfo(r)
        setPrs(p)
        setCommits(c)
      })
      .catch((e) => {
        if (canceled) return
        setError(e instanceof Error ? e.message : '加载失败')
      })

    return () => {
      canceled = true
    }
  }, [repo.owner, repo.repo])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="font-display text-[22px] tracking-[0.2px]">{title}</div>
          <div className="mt-1 max-w-[76ch] text-sm text-white/60">
            {repoInfo ? repoInfo.description || '—' : <span className="inline-block h-4 w-56 animate-pulse rounded bg-white/10" />}
          </div>
        </div>
        <a
          href={`https://github.com/${repo.owner}/${repo.repo}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
        >
          打开 GitHub
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200/20 bg-rose-200/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Stars" value={repoInfo?.stargazers_count} />
        <Metric label="Forks" value={repoInfo?.forks_count} />
        <Metric label="Watchers" value={repoInfo?.watchers_count} />
        <Metric label="Open issues" value={repoInfo?.open_issues_count} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recent PRs"
          icon={<GitPullRequest className="h-[18px] w-[18px] text-pink-200" />}
          items={prs}
          render={(pr) => (
            <a
              key={pr.id}
              href={pr.html_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
            >
              <div className="min-w-0">
                <div className="truncate text-white/90">#{pr.number} {pr.title}</div>
                <div className="mt-1 text-xs text-white/55">{pr.user.login} · {pr.merged_at ? 'merged' : pr.state} · {new Date(pr.updated_at).toLocaleDateString()}</div>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">
                {pr.merged_at ? 'merged' : pr.state}
              </span>
            </a>
          )}
        />

        <Panel
          title="Recent commits"
          icon={<GitCommitHorizontal className="h-[18px] w-[18px] text-sky-200" />}
          items={commits}
          render={(c) => (
            <a
              key={c.sha}
              href={c.html_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
            >
              <div className="truncate text-white/90">{c.commit.message.split('\n')[0]}</div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-white/55">
                <span className="truncate">{c.author?.login || c.commit.author.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-white/50">{c.sha.slice(0, 7)}</span>
              </div>
            </a>
          )}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <Image className="h-[18px] w-[18px] text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[14px] tracking-[0.18px]">Gallery-first, provenance-ready</div>
            <div className="mt-0.5 text-xs text-white/60">图片阅读体验 + PR/commit 来源追溯会在画廊页落地</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">{label}</div>
      <div className="mt-2 font-display text-[20px] tracking-[0.2px]">
        {typeof value === 'number' ? value.toLocaleString() : <span className="inline-block h-6 w-16 animate-pulse rounded bg-white/10" />}
      </div>
    </div>
  )
}

function Panel<T>({
  title,
  icon,
  items,
  render,
}: {
  title: string
  icon: ReactNode
  items: T[] | null
  render: (item: T) => ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">{icon}</div>
        <div className="font-display text-[14px] tracking-[0.18px]">{title}</div>
      </div>
      <div className="mt-3 grid gap-2">
        {items
          ? items.map(render)
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[46px] animate-pulse rounded-xl border border-white/10 bg-white/5" />
            ))}
      </div>
    </div>
  )
}
