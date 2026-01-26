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
      <div className="relative w-full">
        <Image
          src="/feature-insights.png"
          alt="Insights Dashboard"
          width={800}
          height={500}
          className="w-full h-auto"
        />
      </div>
    )
  }

  if (type === 'apps') {
    return (
      <div className="relative w-full">
        <Image
          src="/feature-apps.png"
          alt="Apps Dashboard"
          width={800}
          height={500}
          className="w-full h-auto"
        />
      </div>
    )
  }

  if (type === 'notifications') {
    return (
      <div className="relative w-full">
        <Image
          src="/feature-notifications.png"
          alt="Notifications Dashboard"
          width={800}
          height={500}
          className="w-full h-auto"
        />
      </div>
    )
  }

  if (type === 'settings') {
    return (
      <div className="relative w-full">
        <Image
          src="/feature-settings.png"
          alt="Settings Dashboard"
          width={800}
          height={500}
          className="w-full h-auto"
        />
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
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
