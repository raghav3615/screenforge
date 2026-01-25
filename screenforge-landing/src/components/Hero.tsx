'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-6 py-20 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1">
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)]">
                FREE & OPEN SOURCE
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6"
            >
              Understand your{' '}
              <span className="italic font-normal">screen time</span>{' '}
              effortlessly.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md"
            >
              A native Windows dashboard that tracks your app usage, categorizes habits, and keeps all your data private and local. No accounts, no cloud, no tracking.
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <div className="flex items-start gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mt-0.5 shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <div className="text-sm font-medium">100% Free</div>
                  <div className="text-xs text-[var(--text-muted)]">Open source</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mt-0.5 shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <div className="text-sm font-medium">No Account</div>
                  <div className="text-xs text-[var(--text-muted)]">Works offline</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mt-0.5 shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <div className="text-sm font-medium">Local Storage</div>
                  <div className="text-xs text-[var(--text-muted)]">Private data</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mt-0.5 shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <div className="text-sm font-medium">Lightweight</div>
                  <div className="text-xs text-[var(--text-muted)]">&lt;50MB RAM</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3"
            >
              <a href="#download" className="btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
                Download for Windows
              </a>
              <a href="#features" className="btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                View Demo
              </a>
            </motion.div>
          </div>

          {/* Right: App Preview */}
          <motion.div
            variants={itemVariants}
            className="order-1 lg:order-2"
          >
            <div className="feature-image-wrapper">
              <div className="feature-image p-1">
                {/* Window Title Bar */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="ml-2 flex items-center gap-1.5">
                    <Image src="/logo.png" alt="" width={14} height={14} className="rounded-sm" />
                    <span className="text-xs text-[var(--text-muted)]">ScreenForge</span>
                  </div>
                </div>
                
                {/* App Content Preview */}
                <div className="p-4 bg-[var(--bg-tertiary)]">
                  <div className="flex gap-4">
                    {/* Sidebar */}
                    <div className="w-14 shrink-0 flex flex-col gap-2">
                      {[true, false, false, false].map((active, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-lg mx-auto ${
                            active ? 'bg-[#3b82f6]' : 'bg-[var(--bg-secondary)]'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 space-y-3">
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Screen Time', value: '4h 32m' },
                          { label: 'Apps', value: '12' },
                          { label: 'Notifications', value: '47' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-3">
                            <div className="text-[10px] text-[var(--text-muted)] mb-1">{stat.label}</div>
                            <div className="text-sm font-semibold">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Chart Area */}
                      <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                        <div className="text-xs font-medium mb-2">Daily Usage</div>
                        <div className="flex items-end gap-1 h-16">
                          {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t bg-[#3b82f6]/70 hover:bg-[#3b82f6] transition-colors"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
