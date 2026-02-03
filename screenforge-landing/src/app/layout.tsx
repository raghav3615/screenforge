import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const siteUrl = 'https://screenforge.app'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9ebe4' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ScreenForge - Free Windows Screen Time Tracker & Dashboard',
    template: '%s | ScreenForge',
  },
  description: 'Track your Windows screen time, understand your digital habits, and boost productivity. Free, open-source, and 100% private - all data stays on your machine.',
  keywords: [
    'screen time tracker',
    'Windows screen time',
    'productivity app',
    'time tracking software',
    'app usage monitor',
    'digital wellbeing',
    'Windows productivity',
    'free screen time app',
    'open source time tracker',
    'ScreenForge',
    'privacy-focused tracker',
    'offline time tracking',
  ],
  authors: [{ name: 'Raghav Dadhich', url: 'https://ragzus.me' }],
  creator: 'Raghav Dadhich',
  publisher: 'ScreenForge',
  applicationName: 'ScreenForge',
  category: 'Productivity',
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
    title: 'ScreenForge - Free Windows Screen Time Tracker & Dashboard',
    description: 'Track your Windows screen time, understand your digital habits, and boost productivity. Free, open-source, and 100% private.',
    images: [
      {
        url: '/hero-thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'ScreenForge - Windows Screen Time Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@raghav_dadhich',
    creator: '@raghav_dadhich',
    title: 'ScreenForge - Free Windows Screen Time Tracker',
    description: 'Track your Windows screen time, understand your digital habits, and boost productivity. Free, open-source, and 100% private.',
    images: ['/hero-thumbnail.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  other: {
    'msapplication-TileColor': '#0a0a0a',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ScreenForge',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Windows 10, Windows 11',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'A native Windows dashboard that tracks your app usage, categorizes habits, and keeps all your data private and local.',
    author: {
      '@type': 'Person',
      name: 'Raghav Dadhich',
      url: 'https://ragzus.me',
    },
    softwareVersion: '1.0.0',
    downloadUrl: 'https://screenforge.app/ScreenForge-1.0.0-win-x64.exe',
    screenshot: 'https://screenforge.app/hero-thumbnail.png',
    featureList: [
      'Screen time tracking',
      'App usage breakdown',
      'Notification tracking',
      'Customizable themes',
      'Local data storage',
      'No account required',
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="noise-overlay" aria-hidden="true" />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
