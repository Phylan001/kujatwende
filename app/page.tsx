import { Hero } from "@/components/sections/Hero"
import { FeaturedPackages } from "@/components/sections/FeaturedPackages"
import { WhyChooseUs } from "@/components/sections/WhyChooseUs"
import { Testimonials } from "@/components/sections/Testimonials"
import { Newsletter } from "@/components/sections/Newsletter"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      <main>
        <Hero />
        <FeaturedPackages />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
