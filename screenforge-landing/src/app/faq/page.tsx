import type { Metadata } from 'next'
import FAQContent from './FAQContent'

const siteUrl = 'https://screenforge.app'

export const metadata: Metadata = {
  title: 'FAQ — ScreenForge',
  description:
    'Find answers about ScreenForge: installation, privacy & local storage, Windows support, categories, and troubleshooting. Free, open-source, offline-first.',
  keywords: ['ScreenForge FAQ', 'screen time tracker help', 'Windows productivity app support', 'ScreenForge help'],
  alternates: { canonical: `${siteUrl}/faq` },
  openGraph: {
    title: 'FAQ — ScreenForge',
    description: 'Find answers about ScreenForge: installation, privacy & local storage, Windows support, and more.',
    url: `${siteUrl}/faq`,
    siteName: 'ScreenForge',
    type: 'website',
    images: [{ url: `${siteUrl}/hero-thumbnail.png`, width: 1200, height: 630, alt: 'ScreenForge FAQ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ — ScreenForge',
    description: 'Find answers about ScreenForge: installation, privacy & local storage, Windows support, and more.',
    images: [`${siteUrl}/hero-thumbnail.png`],
  },
  robots: { index: true, follow: true },
}

export default function FAQPage() {
  return <FAQContent />
}
