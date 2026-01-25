'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const features = [
  {
    id: 'insights',
    title: 'Daily & Weekly Insights',
    description: 'See your screen time trends over days and weeks. Understand when you\'re most productive with detailed analytics and visual breakdowns of your usage patterns.',
    image: 'insights',
  },
  {
    id: 'apps',
    title: 'App Usage Breakdown',
    description: 'Know exactly which apps consume your time. Get detailed per-app statistics, usage history, and smart categorization into Productivity, Social, Entertainment, and more.',
    image: 'apps',
  },
  {
    id: 'notifications',
    title: 'Notification Tracking',
    description: 'Monitor which apps interrupt you the most. Take control of your notification overload and identify the biggest sources of distraction throughout your day.',
    image: 'notifications',
  },
  {
    id: 'settings',
    title: 'Customizable Themes',
    description: 'Switch between Dark, Light, Tokyo Night, and Skin themes. Personalize your dashboard to match your aesthetic and preferences.',
    image: 'settings',
  },
]

function FeatureMockup({ type }: { type: string }) {
  if (type === 'insights') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Daily Usage</div>
          <div className="flex gap-1">
            {['D', 'W', 'M'].map((t, i) => (
              <span key={i} className={`px-2 py-0.5 text-xs rounded ${i === 0 ? 'bg-[#3b82f6] text-white' : 'text-[var(--text-muted)]'}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-28 pt-4">
          {[35, 55, 42, 78, 65, 45, 60, 52, 70, 48, 82, 58].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-[#3b82f6]/70 hover:bg-[#3b82f6] transition-colors" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    )
  }

  if (type === 'apps') {
    const apps = [
      { name: 'VS Code', time: '2h 14m', percent: 45, color: '#3b82f6' },
      { name: 'Chrome', time: '1h 32m', percent: 32, color: '#60a5fa' },
      { name: 'Slack', time: '45m', percent: 15, color: '#93c5fd' },
      { name: 'Spotify', time: '28m', percent: 8, color: '#bfdbfe' },
    ]
    return (
      <div className="p-4 space-y-3">
        <div className="text-sm font-medium mb-4">Top Apps Today</div>
        {apps.map((app, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ background: app.color }} />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{app.name}</span>
                <span className="text-[var(--text-muted)]">{app.time}</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${app.percent}%`, background: app.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'notifications') {
    const notifs = [
      { app: 'Discord', count: 23 },
      { app: 'WhatsApp', count: 18 },
      { app: 'Mail', count: 12 },
      { app: 'Teams', count: 8 },
    ]
    return (
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">Notifications Today</div>
          <div className="text-2xl font-bold text-[#3b82f6]">61</div>
        </div>
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm">{n.app}</span>
              <span className="px-2 py-0.5 text-xs bg-[var(--bg-tertiary)] rounded-full">{n.count}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'settings') {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium mb-4">Appearance</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Dark', bg: '#0a0a0a', active: true },
            { name: 'Light', bg: '#fdf8f6', active: false },
            { name: 'Tokyo', bg: '#1a1b26', active: false },
            { name: 'Skin', bg: '#f5e0d6', active: false },
          ].map((theme, i) => (
            <div key={i} className={`p-3 rounded-lg border ${theme.active ? 'border-[#3b82f6]' : 'border-[var(--border)]'}`}>
              <div className="w-full h-8 rounded mb-2" style={{ background: theme.bg, border: '1px solid var(--border)' }} />
              <div className="text-xs text-center">{theme.name}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function FeatureSection({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const isEven = index % 2 === 0
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="py-16 md:py-24"
    >
      <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}>
        {/* Text Content */}
        <motion.div 
          className={isEven ? '' : 'lg:col-start-2'}
          initial={{ opacity: 0, x: isEven ? -30 : 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -30 : 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {feature.title}
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
            {feature.description}
          </p>
        </motion.div>

        {/* Image/Preview */}
        <motion.div 
          className={isEven ? '' : 'lg:col-start-1'}
          initial={{ opacity: 0, x: isEven ? 30 : -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? 30 : -30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="feature-image-wrapper">
            <div className="feature-image">
              {/* Window Title Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="ml-2 flex items-center gap-1.5">
                  <Image src="/logo.png" alt="" width={14} height={14} className="rounded-sm" />
                  <span className="text-xs text-[var(--text-muted)]">ScreenForge — {feature.title}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="bg-[var(--bg-tertiary)] min-h-[240px]">
                <FeatureMockup type={feature.image} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function Features() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' })

  return (
    <section id="features" className="section">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Powerful Features
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Everything you need to understand and optimize your digital habits.
          </p>
        </motion.div>

        {/* Feature Sections */}
        <div className="divide-y divide-[var(--border)]">
          {features.map((feature, i) => (
            <FeatureSection key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
