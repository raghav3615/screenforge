'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'

const features = [
  {
    id: 'insights',
    title: 'Daily & Weekly Insights',
    description: 'See your screen time trends over days and weeks. Understand when you\'re most productive with detailed analytics and visual breakdowns of your usage patterns.',
    image: '/feature-insights.png',
    imageAlt: 'ScreenForge Insights Dashboard showing daily and weekly screen time analytics',
  },
  {
    id: 'apps',
    title: 'App Usage Breakdown',
    description: 'Know exactly which apps consume your time. Get detailed per-app statistics, usage history, and smart categorization into Productivity, Social, Entertainment, and more.',
    image: '/feature-apps.png',
    imageAlt: 'ScreenForge Apps Dashboard displaying per-app usage statistics',
  },
  {
    id: 'notifications',
    title: 'Notification Tracking',
    description: 'Monitor which apps interrupt you the most. Take control of your notification overload and identify the biggest sources of distraction throughout your day.',
    image: '/feature-notifications.png',
    imageAlt: 'ScreenForge Notifications Dashboard tracking app interruptions',
  },
  {
    id: 'settings',
    title: 'Customizable Themes',
    description: 'Switch between Dark, Light, Tokyo Night, and Skin themes. Personalize your dashboard to match your aesthetic and preferences.',
    image: '/feature-settings.png',
    imageAlt: 'ScreenForge Settings showing theme customization options',
  },
]

function FeatureSection({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const isEven = index % 2 === 0

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="py-16 md:py-24"
      aria-labelledby={`feature-${feature.id}-title`}
    >
      <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}>
        <motion.div
          className={isEven ? '' : 'lg:col-start-2'}
          initial={{ opacity: 0, x: isEven ? -30 : 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -30 : 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 id={`feature-${feature.id}-title`} className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {feature.title}
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
            {feature.description}
          </p>
        </motion.div>

        <motion.div
          className={isEven ? '' : 'lg:col-start-1'}
          initial={{ opacity: 0, x: isEven ? 30 : -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? 30 : -30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="feature-image-wrapper">
            <div className="feature-image">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="ml-2 flex items-center gap-1.5">
                  <Image src="/logo.png" alt="" width={14} height={14} className="rounded-sm" />
                  <span className="text-xs text-[var(--text-muted)]">ScreenForge — {feature.title}</span>
                </div>
              </div>

              <div className="bg-[var(--bg-tertiary)] min-h-[240px]">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  width={800}
                  height={500}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.article>
  )
}

export default function Features() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' })

  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 id="features-title" className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Powerful Features
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Everything you need to understand and optimize your digital habits.
          </p>
        </motion.header>

        <div className="divide-y divide-[var(--border)]">
          {features.map((feature, i) => (
            <FeatureSection key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
