import { memo, useMemo } from 'react'

function lineClass(line: string) {
  if (line.startsWith('diff --git')) return 'text-sky-200'
  if (line.startsWith('index ')) return 'text-white/55'
  if (line.startsWith('new file mode') || line.startsWith('deleted file mode')) return 'text-amber-200'
  if (line.startsWith('Binary files')) return 'text-amber-200'
  if (line.startsWith('--- ') || line.startsWith('+++ ')) return 'text-white/70'
  if (line.startsWith('@@')) return 'text-violet-200'
  if (line.startsWith('+') && !line.startsWith('+++')) return 'text-emerald-200'
  if (line.startsWith('-') && !line.startsWith('---')) return 'text-rose-200'
  return 'text-white/80'
}

function DiffViewerImpl({ value }: { value: string }) {
  const lines = useMemo(() => value.split('\n'), [value])

  return (
    <pre className="max-h-[520px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 text-[12px] leading-5">
      {lines.map((line, idx) => (
        <div key={idx} className={lineClass(line)}>
          {line || '\u00A0'}
        </div>
      ))}
    </pre>
  )
}

const DiffViewer = memo(DiffViewerImpl)
export default DiffViewer

