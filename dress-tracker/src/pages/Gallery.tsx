import { useEffect, useMemo, useState } from 'react'
import { Camera, ChevronRight, Folder, Image as ImageIcon, X } from 'lucide-react'
import { githubRest } from '@/lib/githubApi'
import { useSettingsStore } from '@/store/settingsStore'

type ContentItem = {
  name: string
  path: string
  type: 'file' | 'dir'
  size: number
  html_url: string
  download_url: string | null
}

function isImage(name: string) {
  const lower = name.toLowerCase()
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp')
  )
}

export default function Gallery() {
  const repo = useSettingsStore((s) => s.repo)
  const [path, setPath] = useState('')
  const [items, setItems] = useState<ContentItem[] | null>(null)
  const [active, setActive] = useState<{ url: string; name: string } | null>(null)

  const crumbs = useMemo(() => {
    const parts = path.split('/').filter(Boolean)
    const acc: Array<{ label: string; value: string }> = [{ label: 'root', value: '' }]
    parts.forEach((p, i) => {
      const value = parts.slice(0, i + 1).join('/')
      acc.push({ label: p, value })
    })
    return acc
  }, [path])

  useEffect(() => {
    let canceled = false
    setItems(null)
    const encoded = path ? `/${encodeURIComponent(path).split('%2F').join('/')}` : ''
    githubRest<ContentItem[] | ContentItem>(`/repos/${repo.owner}/${repo.repo}/contents${encoded}`)
      .then((data) => {
        if (canceled) return
        setItems(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (canceled) return
        setItems([])
      })
    return () => {
      canceled = true
    }
  }, [repo.owner, repo.repo, path])

  const dirs = (items || []).filter((i) => i.type === 'dir').sort((a, b) => a.name.localeCompare(b.name))
  const images = (items || []).filter((i) => i.type === 'file' && isImage(i.name) && i.download_url)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
          <Camera className="h-[18px] w-[18px] text-amber-200" />
        </div>
        <div className="font-display text-[18px] tracking-[0.2px]">Gallery</div>
        <div className="ml-auto text-xs text-white/55">按目录浏览（适合 Dress 的 A–Z 结构）</div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
        {crumbs.map((c, idx) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setPath(c.value)}
            className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1 transition hover:border-white/10 hover:bg-white/5"
          >
            <span className={idx === crumbs.length - 1 ? 'text-pink-100' : 'text-white/75'}>{c.label}</span>
            {idx === crumbs.length - 1 ? null : <ChevronRight className="h-4 w-4 text-white/35" />}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-[14px] tracking-[0.18px]">Directories</div>
            <div className="text-xs text-white/55">{dirs.length}</div>
          </div>
          <div className="mt-3 grid max-h-[520px] gap-2 overflow-auto pr-1">
            {items
              ? dirs.map((d) => (
                  <button
                    key={d.path}
                    type="button"
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
                    onClick={() => setPath(d.path)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Folder className="h-4 w-4 text-sky-200" />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/35" />
                  </button>
                ))
              : Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-[44px] animate-pulse rounded-xl border border-white/10 bg-white/5" />
                ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-[14px] tracking-[0.18px]">Images</div>
            <div className="text-xs text-white/55">{items ? images.length : '—'}</div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {items
              ? images.map((img) => (
                  <button
                    key={img.path}
                    type="button"
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                    onClick={() => setActive({ url: img.download_url!, name: img.name })}
                  >
                    <img
                      src={img.download_url!}
                      alt={img.name}
                      loading="lazy"
                      className="aspect-square w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <div className="truncate text-left text-xs text-white/85">{img.name}</div>
                    </div>
                  </button>
                ))
              : Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
          </div>

          {items && images.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
              <ImageIcon className="h-4 w-4 text-white/55" />
              这个目录下没有常见图片格式（png/jpg/gif/webp）
            </div>
          ) : null}
        </div>
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-6 backdrop-blur" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full max-w-[1200px] flex-col">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e0f13]/90 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-display text-[14px] tracking-[0.18px]">{active.name}</div>
                <div className="mt-0.5 text-xs text-white/60">{repo.owner}/{repo.repo}</div>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <img src={active.url} alt={active.name} className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
