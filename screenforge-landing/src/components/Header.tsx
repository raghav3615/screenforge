'use client'

import { useState, useSyncExternalStore, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useGithubStars, formatStars } from '@/lib/useGithubStars'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Product', href: '/#product' },
  { label: 'Compare', href: '/#compare' },
  { label: 'FAQ', href: '/faq' },
]

const GITHUB_REPO = 'raghav3615/screenforge'
const subscribe = () => () => {}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const stars = useGithubStars()
  const label = formatStars(stars)
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <nav
          aria-label="Main"
          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-300 ${
            scrolled
              ? 'border-[var(--line-strong)] bg-[var(--bg)]/85 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)]'
              : 'border-transparent bg-transparent'
          }`}
        >
          <a href="/" className="flex items-center gap-2.5" aria-label="ScreenForge home">
            <Image src="/logo.png" alt="ScreenForge" width={28} height={28} className="rounded-[8px]" priority />
            <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">ScreenForge</span>
            <span className="hidden sm:inline-flex font-mono text-[10px] tracking-[0.12em] text-[var(--text-3)] border border-[var(--line)] rounded-md px-1.5 py-0.5 ml-1">V1.0.1</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 text-[13.5px] font-medium text-[var(--text-2)] hover:text-[var(--text-1)] rounded-lg hover:bg-[var(--panel-2)] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-[13px] font-medium hover:border-[var(--line-strong)] transition-colors"
              aria-label={stars !== null ? `${stars} stars on GitHub` : 'Star on GitHub'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" /></svg>
              <span className="tabular-nums min-w-[2ch] inline-block text-right">{label ?? '–'}</span>
            </a>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--line-strong)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )}
              </button>
            )}

            <a href="/ScreenForge-1.0.1-win-x64.exe" download className="btn-primary !py-2 !px-4 hidden md:inline-flex">
              Download
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </a>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-9 h-9 rounded-[10px] flex items-center justify-center border border-[var(--line)] bg-[var(--panel)]"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>)}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 rounded-2xl border border-[var(--line-strong)] bg-[var(--bg)]/95 backdrop-blur-xl p-2"
            >
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] rounded-xl hover:bg-[var(--panel-2)]">
                  {l.label}
                </a>
              ))}
              <a href="/ScreenForge-1.0.1-win-x64.exe" download className="btn-primary w-full mt-2">Download for Windows</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
