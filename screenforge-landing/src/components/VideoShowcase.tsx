'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function VideoShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.5, 1])

  return (
    <section id="preview" ref={containerRef} className="section relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Built for Windows
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            A native desktop experience designed to feel right at home on your PC.
          </p>
        </motion.div>

        {/* Desktop Window */}
        <motion.div
          style={{ y, scale, opacity }}
          className="relative"
        >
          <div className="window-chrome max-w-5xl mx-auto">
            {/* Window Title Bar */}
            <div className="window-titlebar">
              <div className="window-dot window-dot--close" />
              <div className="window-dot window-dot--minimize" />
              <div className="window-dot window-dot--maximize" />
              <span className="ml-4 text-sm text-[var(--text-muted)]">ScreenForge</span>
            </div>

            {/* Window Content - Video/Image placeholder */}
            <div className="relative aspect-[16/10] bg-[var(--bg-tertiary)] overflow-hidden">
              {/* Placeholder for app screenshot/video */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Mock Dashboard UI */}
                <div className="w-full h-full p-6 flex gap-6">
                  {/* Sidebar mock */}
                  <div className="w-16 shrink-0 flex flex-col gap-4 py-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 mx-auto rounded-lg ${
                          i === 0 ? 'bg-[var(--accent)]' : 'bg-[var(--bg-secondary)]'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Main content mock */}
                  <div className="flex-1 flex flex-col gap-6">
                    {/* Header mock */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-6 w-40 bg-[var(--text-primary)]/20 rounded" />
                        <div className="h-4 w-56 bg-[var(--text-muted)]/20 rounded mt-2" />
                      </div>
                      <div className="h-10 w-32 bg-[var(--bg-secondary)] rounded-lg" />
                    </div>

                    {/* Stats row mock */}
                    <div className="grid grid-cols-4 gap-4">
                      {['4h 32m', '12', 'Productivity', '47'].map((stat, i) => (
                        <div key={i} className="bg-[var(--bg-secondary)] rounded-xl p-4">
                          <div className="text-xs text-[var(--text-muted)]">
                            {['Screen Time', 'Apps Used', 'Top Category', 'Notifications'][i]}
                          </div>
                          <div className="text-xl font-semibold mt-1">{stat}</div>
                        </div>
                      ))}
                    </div>

                    {/* Charts row mock */}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                        <div className="text-sm font-medium">Daily Usage</div>
                        <div className="mt-4 flex items-end gap-2 h-24">
                          {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-[var(--accent)]/30 rounded-t"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                        <div className="text-sm font-medium">Categories</div>
                        <div className="mt-4 flex items-end gap-2 h-24">
                          {[
                            { h: 80, c: '#4f8bff' },
                            { h: 60, c: '#8c7dff' },
                            { h: 45, c: '#2ed47a' },
                            { h: 30, c: '#ff8b6a' },
                          ].map((bar, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t"
                              style={{ height: `${bar.h}%`, background: bar.c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)]/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-[var(--bg-primary)] to-transparent blur-sm" />
        </motion.div>

        {/* Feature highlights below window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: 'Real-time Tracking',
              description: 'Captures active window every 5 seconds using native Windows APIs.',
            },
            {
              title: 'Smart Categories',
              description: 'Automatically categorizes apps into Productivity, Social, Entertainment, and more.',
            },
            {
              title: 'Privacy First',
              description: 'All data stays on your machine. No cloud sync, no tracking, no accounts.',
            },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="mt-2 text-[var(--text-secondary)] text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
