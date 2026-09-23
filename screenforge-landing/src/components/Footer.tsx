'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useGithubStars, formatStars } from '@/lib/useGithubStars'

const GITHUB_REPO = 'raghav3615/screenforge'

export default function Footer() {
  const stars = useGithubStars()
  const label = formatStars(stars)

  return (
    <footer id="download" className="border-t border-[var(--line)]" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-[var(--panel)] px-6 py-14 sm:px-14 sm:py-20 text-center"
        >
          <div className="absolute inset-0 grid-bg opacity-70" aria-hidden="true" />
          <div aria-hidden="true" className="absolute left-1/2 top-0 h-[280px] w-[560px] -translate-x-1/2 rounded-full blur-[100px]" style={{ background: 'var(--glow)' }} />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg-soft)]">
              <Image src="/logo.png" alt="ScreenForge" width={32} height={32} className="rounded-lg" />
            </div>
            <h2 className="display text-[34px] sm:text-[54px]">Own your attention.</h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[var(--text-2)]">
              Free. Open source. Private by architecture, not by promise.
              Takes 30 seconds to install.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/ScreenForge-1.0.1-win-x64.exe" download className="btn-primary px-7 py-3.5 text-[15px] w-full sm:w-auto">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" /></svg>
                Download for Windows
              </a>
              <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer" className="btn-ghost px-7 py-3.5 text-[15px] w-full sm:w-auto" aria-label={stars !== null ? `${stars} stars on GitHub` : 'View on GitHub'}>
                GitHub{label !== null ? <span className="tabular-nums text-[var(--text-3)]"> · {label} ★</span> : null}
              </a>
            </div>
            <p className="mt-5 font-mono text-[11px] tracking-[0.1em] text-[var(--text-3)] uppercase">Requires Windows 10+ · No account · MIT licensed</p>
          </div>
        </motion.div>

        <div className="mt-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="/" className="flex items-center gap-2.5" aria-label="ScreenForge home">
              <Image src="/logo.png" alt="ScreenForge" width={26} height={26} className="rounded-md" />
              <span className="font-display text-[15px] font-semibold tracking-tight">ScreenForge</span>
            </a>
            <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-[var(--text-2)]">
              A native Windows screen-time dashboard. Track usage, cut interruptions, stay in flow.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--line)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--line-strong)] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
              <a href="https://x.com/raghav_dadhich" target="_blank" rel="noopener noreferrer" aria-label="X" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--line)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--line-strong)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>
          </div>
          <nav aria-label="Product">
            <h3 className="font-mono text-[11px] tracking-[0.14em] text-[var(--text-3)] uppercase">Product</h3>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href="/#features">Features</a></li>
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href="/#product">Tour</a></li>
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href="/#download">Download</a></li>
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href="/faq">FAQ</a></li>
            </ul>
          </nav>
          <nav aria-label="Developers">
            <h3 className="font-mono text-[11px] tracking-[0.14em] text-[var(--text-3)] uppercase">Developers</h3>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer">Source</a></li>
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href={`https://github.com/${GITHUB_REPO}/releases`} target="_blank" rel="noopener noreferrer">Releases</a></li>
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href={`https://github.com/${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer">Issues</a></li>
            </ul>
          </nav>
          <nav aria-label="Meta">
            <h3 className="font-mono text-[11px] tracking-[0.14em] text-[var(--text-3)] uppercase">Meta</h3>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              <li><a className="text-[var(--text-2)] hover:text-[var(--text-1)]" href="https://ragzus.me" target="_blank" rel="noopener noreferrer">Author</a></li>
              <li><span className="text-[var(--text-2)]">MIT License</span></li>
              <li><span className="font-mono text-[12px] text-[var(--text-3)]">v1.0.1 · win-x64</span></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--line)] pt-6">
          <p className="text-[12px] text-[var(--text-3)]">© {new Date().getFullYear()} ScreenForge · Open source under MIT.</p>
          <p className="text-[12px] text-[var(--text-3)]">Forged on Windows by <a href="https://ragzus.me/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-1)] hover:underline">Raghav Dadhich</a></p>
        </div>

        <div aria-hidden="true" className="wordmark-giant mt-8 text-center text-[13.5vw] leading-none tracking-tight">SCREENFORGE</div>
      </div>
    </footer>
  )
}
