import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import Features from '@/components/Features'
import Showcase from '@/components/Showcase'
import HowAndCompare from '@/components/HowAndCompare'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <div className="mt-16 sm:mt-20">
        <Marquee />
      </div>
      <Features />
      <Showcase />
      <HowAndCompare />
      <Footer />
    </main>
  )
}
