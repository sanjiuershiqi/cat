import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useMemo } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

function absoluteUrl(owner: string, repo: string, path: string) {
  const clean = path.replace(/^\//, '').replace(/^\.\//, '')
  return `https://raw.githubusercontent.com/${owner}/${repo}/master/${clean}`
}

function absoluteBlobUrl(owner: string, repo: string, path: string) {
  const clean = path.replace(/^\//, '').replace(/^\.\//, '')
  return `https://github.com/${owner}/${repo}/blob/master/${clean}`
}

export default function Markdown({ value }: { value: string }) {
  const repo = useSettingsStore((s) => s.repo)

  const components = useMemo(
    () => ({
      a: (props: any) => {
        const href = typeof props.href === 'string' ? props.href : ''
        const nextHref = href && !href.startsWith('http') && !href.startsWith('#') ? absoluteBlobUrl(repo.owner, repo.repo, href) : href
        return (
          <a
            {...props}
            href={nextHref}
            target="_blank"
            rel="noreferrer"
            className="text-sky-200 underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
          />
        )
      },
      img: (props: any) => {
        const src = typeof props.src === 'string' ? props.src : ''
        const nextSrc = src && !src.startsWith('http') ? absoluteUrl(repo.owner, repo.repo, src) : src
        return (
          <img
            {...props}
            src={nextSrc}
            className="mt-3 max-w-full rounded-2xl border border-white/10"
            loading="lazy"
          />
        )
      },
      p: (props: any) => <p {...props} className="mt-3 text-sm leading-7 text-white/80" />,
      h1: (props: any) => <h1 {...props} className="mt-5 font-display text-[22px] tracking-[0.2px]" />,
      h2: (props: any) => <h2 {...props} className="mt-5 font-display text-[18px] tracking-[0.2px]" />,
      h3: (props: any) => <h3 {...props} className="mt-4 font-display text-[16px] tracking-[0.18px]" />,
      code: (props: any) => <code {...props} className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] text-white/85" />,
      pre: (props: any) => (
        <pre {...props} className="mt-3 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 text-[12px] text-white/80" />
      ),
      ul: (props: any) => <ul {...props} className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80" />,
      ol: (props: any) => <ol {...props} className="mt-3 list-decimal space-y-1 pl-5 text-sm text-white/80" />,
      blockquote: (props: any) => (
        <blockquote {...props} className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/75" />
      ),
    }),
    [repo.owner, repo.repo],
  )

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {value}
    </ReactMarkdown>
  )
}

