'use client'

const items = [
  'LOCAL-FIRST',
  'MIT LICENSE',
  'NO ACCOUNT',
  'OFFLINE CAPABLE',
  'WINDOWS NATIVE',
  'OPEN SOURCE',
  'NO TELEMETRY',
  '< 50MB RAM',
]

export default function Marquee() {
  const row = [...items, ...items]
  return (
    <div className="relative border-y border-[var(--line)] bg-[var(--bg-soft)]/60 overflow-hidden" aria-hidden="true">
      <div className="mask-fade-x">
        <div className="animate-marquee flex w-max items-center gap-10 px-6 py-3.5">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-10 font-mono text-[11px] tracking-[0.18em] text-[var(--text-3)] whitespace-nowrap">
              {t}
              <span className="inline-block h-1 w-1 rounded-full bg-[var(--forge)]" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
