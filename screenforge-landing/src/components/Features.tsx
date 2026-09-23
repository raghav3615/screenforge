'use client'

import { motion } from 'framer-motion'

const bars = [38, 56, 44, 72, 58, 86, 64]

const apps = [
  { name: 'code.exe', cat: 'Productivity', time: '3h 12m', w: 82, c: '#ff4d00' },
  { name: 'chrome.exe', cat: 'Browsing', time: '1h 48m', w: 54, c: '#4f8bff' },
  { name: 'discord.exe', cat: 'Social', time: '42m', w: 28, c: '#8c7dff' },
  { name: 'spotify.exe', cat: 'Entertainment', time: '31m', w: 20, c: '#2ed47a' },
]

const notes = [
  { app: 'Slack', n: 23 },
  { app: 'Mail', n: 14 },
  { app: 'Teams', n: 9 },
]

function Card({ index, title, desc, children, span }: { index: string; title: string; desc: string; children: React.ReactNode; span?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`bento ${span ?? ''}`}
    >
      <div className="bento-index">{index}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="mt-6">{children}</div>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section id="features" className="section-pad" aria-labelledby="features-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="eyebrow text-[var(--forge-ink)]">— Features</div>
          <h2 id="features-title" className="display mt-3 text-[32px] sm:text-[48px]">
            Everything you need.
            <br />
            Nothing that phones home.
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-[var(--text-2)]">
            One native app. Four views. Your data never leaves the machine —
            inspect the source if you don&apos;t believe us.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card index="01 / INSIGHTS" title="Daily & weekly trends" desc="Screen time plotted honestly. Spot your deep-work windows and your doom-scroll hours." span="md:col-span-4">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[26px] font-semibold tracking-tight tabular-nums">4h 32m</span>
                <span className="font-mono text-[11px] text-[var(--text-3)]">TODAY · −18% VS AVG</span>
              </div>
              <div className="mt-4 flex h-28 items-end gap-2">
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-[5px]" style={{ height: `${h}%`, background: i === 5 ? 'var(--forge)' : 'var(--line-strong)', opacity: i === 5 ? 1 : 0.55 }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--text-3)]">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
          </Card>

          <Card index="02 / PRIVACY" title="Local by default" desc="SQLite on disk. No signup, no sync, one-click wipe." span="md:col-span-2">
            <div className="rounded-xl border border-[var(--line)] bg-[#0b0e14] p-4 font-mono text-[11.5px] leading-relaxed text-zinc-300">
              <div className="text-zinc-500">C:\Users\you\AppData\…</div>
              <div><span className="text-emerald-400">✓</span> screenforge.db <span className="text-zinc-500">— 2.1 MB</span></div>
              <div><span className="text-emerald-400">✓</span> network calls <span className="text-zinc-500">— 0</span></div>
              <div><span className="text-emerald-400">✓</span> accounts <span className="text-zinc-500">— none</span></div>
            </div>
          </Card>

          <Card index="03 / APPS" title="Per-app breakdown" desc="Exactly which executables eat your hours, auto-categorized." span="md:col-span-2">
            <div className="space-y-2.5">
              {apps.map((a) => (
                <div key={a.name} className="rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-2.5">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="font-mono font-medium">{a.name}</span>
                    <span className="tabular-nums text-[var(--text-2)]">{a.time}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${a.w}%`, background: a.c }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card index="04 / FOCUS" title="Interruption ledger" desc="Which apps yank your attention, ranked by notification volume." span="md:col-span-2">
            <div className="space-y-2">
              {notes.map((n, i) => (
                <div key={n.app} className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] px-3.5 py-3">
                  <span className="text-[13px] font-medium"><span className="font-mono text-[11px] text-[var(--text-3)] mr-2">0{i + 1}</span>{n.app}</span>
                  <span className="rounded-md bg-[var(--forge)]/12 px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--forge-ink)]">{n.n} pings</span>
                </div>
              ))}
              <p className="font-mono text-[10.5px] tracking-wide text-[var(--text-3)] pt-1">→ MUTE THE TOP 2, RECLAIM ~1H/DAY</p>
            </div>
          </Card>

          <Card index="05 / CRAFT" title="Themes that respect the OS" desc="Dark, Light, Tokyo Night, Skin. Fluent-native, no Electron bloat." span="md:col-span-2">
            <div className="grid grid-cols-4 gap-2">
              {[
                ['#09090b', '#fafafa'],
                ['#fafaf9', '#09090b'],
                ['#1a1b26', '#7aa2f7'],
                ['#f9ebe4', '#1a1a1a'],
              ].map(([bg, fg], i) => (
                <div key={i} className="rounded-lg border border-[var(--line)] p-1.5" style={{ background: bg }}>
                  <div className="h-8 rounded-[6px]" style={{ background: fg, opacity: 0.16 }} />
                  <div className="mx-auto mt-1.5 h-1 w-8 rounded-full" style={{ background: fg, opacity: 0.7 }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <span className="kbd">Dark</span><span className="kbd">Light</span><span className="kbd">Tokyo</span><span className="kbd">Skin</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
