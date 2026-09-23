'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const tabs = [
  { id: 'insights', label: 'Insights', img: '/feature-insights.png', alt: 'ScreenForge insights dashboard', meta: 'Trends · streaks · weekly deltas' },
  { id: 'apps', label: 'Apps', img: '/feature-apps.png', alt: 'ScreenForge per-app usage', meta: 'Executables · categories · history' },
  { id: 'notifications', label: 'Interruptions', img: '/feature-notifications.png', alt: 'ScreenForge notification tracking', meta: 'Volume · sources · quiet hours' },
  { id: 'settings', label: 'Settings', img: '/feature-settings.png', alt: 'ScreenForge settings and themes', meta: 'Themes · categories · data controls' },
]

export default function Showcase() {
  const [active, setActive] = useState(tabs[0])

  return (
    <section id="product" className="section-pad border-t border-[var(--line)]" aria-labelledby="product-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="eyebrow text-[var(--forge-ink)]">— Product tour</div>
            <h2 id="product-title" className="display mt-3 text-[32px] sm:text-[48px]">Built like a system utility. Feels like a product.</h2>
          </div>
          <p className="max-w-sm text-[14.5px] leading-relaxed text-[var(--text-2)]">
            Four views, zero clutter. Switch tabs — every screenshot below is the real app, running on Windows.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Product views">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active.id === t.id}
              onClick={() => setActive(t)}
              className={`rounded-[10px] border px-4 py-2 text-[13.5px] font-medium transition-all ${
                active.id === t.id
                  ? 'border-[var(--text-1)] bg-[var(--text-1)] text-[var(--bg)]'
                  : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text-2)] hover:border-[var(--line-strong)] hover:text-[var(--text-1)]'
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto hidden md:inline font-mono text-[11px] text-[var(--text-3)] self-center">{active.meta}</span>
        </div>

        <div className="app-window mt-4">
          <div className="app-titlebar">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-[11px] text-[var(--text-3)]">screenforge — {active.id}</span>
            <span className="ml-auto font-mono text-[10px] text-[var(--text-3)] hidden sm:inline">LOCAL · {active.meta.toUpperCase()}</span>
          </div>
          <div className="relative min-h-[280px] sm:min-h-[420px] bg-[var(--bg-soft)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image src={active.img} alt={active.alt} width={1600} height={1000} className="w-full h-auto" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
