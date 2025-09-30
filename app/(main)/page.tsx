import { Hero } from "@/components/sections/Hero";
import { FeaturedPackages } from "@/components/sections/FeaturedPackages";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { Newsletter } from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedPackages />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}
