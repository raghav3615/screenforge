'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const faqs = [
  {
    question: 'How do I download ScreenForge?',
    answer: 'You can download ScreenForge in two ways: 1) Click the "Download for Windows" button on our website to get the latest release, or 2) Clone the GitHub repository at https://github.com/raghav3615/screenforge and build it yourself. Both methods are completely free.',
  },
  {
    question: 'Is ScreenForge really free and open source?',
    answer: 'Yes! ScreenForge is 100% free and open source. The entire source code is available on GitHub under the MIT License. You can inspect, modify, and distribute it however you like. There are no hidden costs, subscriptions, or premium features.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No account required! ScreenForge works completely offline and doesn\'t require any registration, login, or cloud services. Just download, install, and start using it immediately.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'All your data is stored locally on your Windows machine. Nothing is sent to the cloud or any external servers. Your screen time data, app usage, and notification history remain completely private and under your control.',
  },
  {
    question: 'Can I delete my data?',
    answer: 'Absolutely! You can clear all your data with a single click from the Settings page. ScreenForge also allows you to delete specific date ranges or reset everything back to a fresh state. Your data is yours to manage.',
  },
  {
    question: 'How much system resources does ScreenForge use?',
    answer: 'ScreenForge is lightweight and efficient. It uses minimal RAM (typically under 50MB) and very little disk space (less than 100MB). The app runs quietly in the background without impacting your system performance.',
  },
  {
    question: 'What Windows versions are supported?',
    answer: 'ScreenForge requires Windows 10 or later. It uses native Windows APIs for tracking, so older versions of Windows are not supported.',
  },
  {
    question: 'How does ScreenForge track my screen time?',
    answer: 'ScreenForge captures the active foreground application every 5 seconds using native Windows APIs. It aggregates this data locally and categorizes apps automatically. No internet connection is required for tracking.',
  },
  {
    question: 'Can I customize app categories?',
    answer: 'Yes! ScreenForge automatically categorizes apps into Productivity, Social, Entertainment, and more. You can manually adjust categories for any app from the Settings page to match your preferences.',
  },
  {
    question: 'Does ScreenForge work when my computer is locked?',
    answer: 'No, ScreenForge only tracks active usage when your computer is unlocked and you\'re actively using applications. Locked or idle time is not counted toward your screen time.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Currently, ScreenForge stores data locally in a format that can be accessed directly. Future versions may include export functionality for CSV or JSON formats. Since it\'s open source, you can also contribute this feature!',
  },
  {
    question: 'What if I find a bug or want to suggest a feature?',
    answer: 'Since ScreenForge is open source, you can report bugs, request features, or contribute code directly on GitHub at https://github.com/raghav3615/screenforge. We welcome community contributions!',
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-[var(--border)] last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 text-left flex items-start justify-between gap-4 group"
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors flex-1">
          {faq.question}
        </h3>
        <svg
          className={`w-5 h-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-[var(--text-secondary)] leading-relaxed">
          {faq.answer}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="ScreenForge" width={48} height={48} className="rounded-lg" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h1>
            </div>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              Everything you need to know about ScreenForge. Can't find what you're looking for?{' '}
              <a
                href="https://github.com/raghav3615/screenforge/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Open an issue on GitHub
              </a>
              .
            </p>
          </motion.div>

          {/* FAQ List */}
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-[var(--text-secondary)] mb-6">
              Ready to start tracking your screen time?
            </p>
            <a href="/ScreenForge-1.0.0-win-x64.exe" download className="btn-primary inline-flex">
              Download ScreenForge
            </a>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
