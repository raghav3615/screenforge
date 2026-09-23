'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const ease = [0.16, 1, 0.3, 1] as const

const stats = [
  { k: '100%', v: 'local — zero telemetry' },
  { k: '<50MB', v: 'idle RAM footprint' },
  { k: '5s', v: 'foreground polling' },
  { k: 'MIT', v: 'open source forever' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 sm:pt-44" aria-labelledby="hero-title">
      {/* backdrop: grid + forge glow */}
      <div className="absolute inset-0 grid-bg mask-fade-y" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[-320px] h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: 'var(--glow)' }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--line-strong)] to-transparent" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mx-auto max-w-3xl text-center"
        >
          <a href="https://github.com/raghav3615/screenforge/releases" target="_blank" rel="noopener noreferrer" className="pill mx-auto">
            <span className="dot" />
            v1.0.1 now available
            <span className="text-[var(--text-3)]">→</span>
          </a>

          <h1 id="hero-title" className="display mt-6 text-[44px] sm:text-[68px] lg:text-[80px]">
            See where your
            <br />
            day <span className="italic font-light">really</span> goes.
          </h1>

          <p className="body-tight mx-auto mt-6 max-w-xl text-[16px] sm:text-[18px] leading-relaxed text-[var(--text-2)]">
            ScreenForge is a native Windows dashboard that tracks app usage,
            flags interruptions, and keeps every byte on your machine.
            No account. No cloud. No noise.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/ScreenForge-1.0.1-win-x64.exe" download className="btn-primary w-full sm:w-auto px-7 py-3.5 text-[15px]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" /></svg>
              Download for Windows
            </a>
            <a href="https://github.com/raghav3615/screenforge" target="_blank" rel="noopener noreferrer" className="btn-ghost w-full sm:w-auto px-7 py-3.5 text-[15px]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              Star on GitHub
            </a>
          </div>

          <p className="mt-5 font-mono text-[11px] tracking-[0.08em] text-[var(--text-3)] uppercase">
            Windows 10 / 11 &nbsp;·&nbsp; ~18 MB &nbsp;·&nbsp; No sign-up
          </p>
        </motion.div>

        {/* product window */}
        <motion.div
          initial={{ opacity: 0, y: 64, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="relative mx-auto mt-14 sm:mt-16 max-w-5xl"
        >
          <div aria-hidden="true" className="absolute -inset-x-8 top-8 bottom-[-40px] rounded-[32px] blur-[80px] opacity-60" style={{ background: 'var(--glow)' }} />
          <div className="app-window relative">
            <div className="app-titlebar">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="" width={14} height={14} className="rounded-[4px]" />
                <span className="font-mono text-[11px] text-[var(--text-3)]">screenforge — demo</span>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2 font-mono text-[10px] text-[var(--text-3)]">
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />DEMO · 1 MIN</span>
                <span className="ml-1 hidden lg:inline">offline · local-first</span>
              </div>
            </div>
            <div className="relative aspect-video bg-black">
              <iframe
                src="https://www.youtube.com/embed/8N5Uhrui0fw?rel=0&modestbranding=1"
                title="ScreenForge Demo Video - Windows Screen Time Dashboard"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                loading="lazy"
              />
            </div>
          </div>

          {/* spec strip */}
          <div className="relative mt-4 grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)]/90 backdrop-blur overflow-hidden divide-x divide-y md:divide-y-0 divide-[var(--line)]">
            {stats.map((s) => (
              <div key={s.k} className="px-5 py-4">
                <div className="font-display text-[19px] font-semibold tracking-[-0.02em] tabular-nums">{s.k}</div>
                <div className="mt-0.5 text-[12.5px] text-[var(--text-2)]">{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
