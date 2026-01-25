'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const GITHUB_REPO = 'raghav3615/screenforge'

export default function Footer() {
  const ctaRef = useRef(null)
  const footerRef = useRef(null)
  const isCtaInView = useInView(ctaRef, { once: true, margin: '-100px' })
  const isFooterInView = useInView(footerRef, { once: true, margin: '-50px' })
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <footer id="download" className="border-t border-[var(--border)]">
      {/* Download CTA */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 50 }}
          animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isCtaInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] mb-6"
          >
            <Image src="/logo.png" alt="ScreenForge" width={40} height={40} className="rounded-lg" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Start Tracking Today
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
            Free, open-source, and privacy-focused. All your data stays on your machine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <a href="https://github.com/raghav3615/screenforge/releases" target="_blank" rel="noopener noreferrer" className="btn-primary px-6 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              Download for Windows
            </a>
            <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
              {stars !== null && (
                <span className="ml-1 text-[var(--text-muted)]">({stars})</span>
              )}
            </a>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Requires Windows 10 or later
          </p>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <motion.div
        ref={footerRef}
        initial={{ opacity: 0 }}
        animate={isFooterInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="border-t border-[var(--border)] bg-[var(--bg-secondary)]"
      >
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <a href="/" className="flex items-center gap-2.5 mb-4">
                <Image src="/logo.png" alt="ScreenForge" width={28} height={28} className="rounded-md" />
                <span className="text-sm font-semibold">ScreenForge</span>
              </a>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-4">
                Windows screen time dashboard for understanding your digital habits. Track usage, manage notifications, and stay productive.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="/#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#download" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Download
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href={`https://github.com/${GITHUB_REPO}/releases`} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href={`https://github.com/${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Issues
                  </a>
                </li>
                <li>
                  <a href={`https://github.com/${GITHUB_REPO}/blob/main/README.md`} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              {new Date().getFullYear()} ScreenForge. Open source under MIT License.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Made with care for Windows users
            </p>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}
