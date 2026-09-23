import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const display = Inter_Tight({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

const siteUrl = 'https://screenforge.app'
const ogImage = `${siteUrl}/hero-thumbnail.png`

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ScreenForge — See where your day really goes',
    template: '%s | ScreenForge',
  },
  description:
    'Free, open-source Windows screen time tracker. Native dashboard, offline-first, no account. All data stays on your machine. Download for Windows 10/11 (MIT).',
  keywords: [
    'screen time tracker',
    'Windows screen time',
    'Windows screen time tracker',
    'productivity app',
    'time tracking software',
    'app usage monitor',
    'digital wellbeing',
    'free screen time app',
    'open source time tracker',
    'ScreenForge',
    'Windows 11 screen time',
    'offline time tracking',
    'privacy focused tracker',
    'RescueTime alternative',
    'ManicTime alternative',
  ],
  authors: [{ name: 'Raghav Dadhich', url: 'https://ragzus.me' }],
  creator: 'Raghav Dadhich',
  publisher: 'ScreenForge',
  applicationName: 'ScreenForge',
  category: 'Productivity',
  referrer: 'origin-when-cross-origin',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ScreenForge',
    title: 'ScreenForge — See where your day really goes',
    description: 'Free, open-source Windows screen time tracker. Native, offline-first, private by design.',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'ScreenForge — Windows screen time dashboard', type: 'image/png' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@raghav_dadhich',
    creator: '@raghav_dadhich',
    title: 'ScreenForge — See where your day really goes',
    description: 'Free, open-source Windows screen time tracker. Native, offline-first, private by design.',
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: siteUrl },
  verification: {
    // add when you have them: google: '...', yandex: '...'
  },
  other: {
    'msapplication-TileColor': '#09090b',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ScreenForge',
    alternateName: 'ScreenForge Windows Tracker',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Windows 10, Windows 11',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    description: 'Native Windows dashboard that tracks app usage, categorizes habits, and keeps all data private and local. Offline-first, no account, MIT licensed.',
    author: { '@type': 'Person', name: 'Raghav Dadhich', url: 'https://ragzus.me' },
    publisher: { '@type': 'Organization', name: 'ScreenForge', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/icon.png` } },
    softwareVersion: '1.0.1',
    downloadUrl: 'https://screenforge.app/ScreenForge-1.0.1-win-x64.exe',
    installUrl: 'https://screenforge.app/#download',
    screenshot: ogImage,
    featureList: ['Screen time tracking', 'App usage breakdown', 'Notification tracking', 'Customizable themes', 'Local data storage', 'No account required'],
    license: 'https://github.com/raghav3615/screenforge/blob/main/LICENSE',
    isAccessibleForFree: true,
    codeRepository: 'https://github.com/raghav3615/screenforge',
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ScreenForge',
    url: siteUrl,
    publisher: { '@type': 'Organization', name: 'ScreenForge', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/icon.png` } },
    potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/faq?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ScreenForge',
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    sameAs: ['https://github.com/raghav3615/screenforge', 'https://x.com/raghav_dadhich'],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.github.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className={`${inter.variable} ${display.variable} ${mono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="noise-overlay" aria-hidden="true" />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
