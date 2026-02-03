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

const features = [
  { title: '100% Free', subtitle: 'Open source' },
  { title: 'No Account', subtitle: 'Works offline' },
  { title: 'Local Storage', subtitle: 'Private data' },
  { title: 'Lightweight', subtitle: '<50MB RAM' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden mb-20" aria-labelledby="hero-title">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
          <div className="order-2 lg:order-1">
            <motion.div variants={itemVariants} className="mb-4">
              <a
                href="https://www.producthunt.com/products/screenforge?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-screenforge"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1068186&theme=dark&t=1769411375009"
                  alt="ScreenForge featured on Product Hunt"
                  width="250"
                  height="54"
                  loading="lazy"
                />
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="ml-2">FREE & OPEN SOURCE</span>
              </span>
            </motion.div>

            <motion.h1
              id="hero-title"
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6"
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

            <motion.ul
              variants={itemVariants}
              className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 list-none"
            >
              {features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mt-0.5 shrink-0" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium">{feature.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">{feature.subtitle}</div>
                  </div>
                </li>
              ))}
            </motion.ul>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3"
            >
              <a href="/ScreenForge-1.0.0-win-x64.exe" download className="btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
                Download for Windows
              </a>
              <a href="https://github.com/raghav3615/screenforge" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="order-1 lg:order-2"
          >
            <div className="feature-image-wrapper">
              <div className="feature-image p-1 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)]">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="ml-2 flex items-center gap-1.5">
                    <Image src="/logo.png" alt="" width={14} height={14} className="rounded-sm" />
                    <span className="text-xs text-[var(--text-muted)]">ScreenForge</span>
                  </div>
                </div>

                <div className="relative aspect-video bg-[var(--bg-tertiary)]">
                  <iframe
                    src="https://www.youtube.com/embed/8N5Uhrui0fw?rel=0&modestbranding=1"
                    title="ScreenForge Demo Video - Windows Screen Time Dashboard"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
