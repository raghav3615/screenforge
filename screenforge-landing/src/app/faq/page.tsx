import { Metadata } from 'next'
import FAQContent from './FAQContent'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about ScreenForge - the free, open-source Windows screen time tracker. Learn about installation, data privacy, features, and more.',
  keywords: [
    'ScreenForge FAQ',
    'screen time tracker help',
    'Windows productivity app support',
    'screen time questions',
    'ScreenForge help',
  ],
  openGraph: {
    title: 'FAQ - ScreenForge',
    description: 'Find answers to common questions about ScreenForge - the free, open-source Windows screen time tracker.',
  },
}

export default function FAQPage() {
  return <FAQContent />
}
