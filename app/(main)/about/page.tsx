"use client";

import { Button } from "@/components/ui/button";
import { Award, Users, Globe, Heart, Star, MapPin } from "lucide-react";
import Link from "next/link";

const stats = [
  { icon: Users, label: "Happy Travelers", value: "1000+" },
  { icon: MapPin, label: "Destinations", value: "50+" },
  { icon: Award, label: "Years Experience", value: "5+" },
  { icon: Star, label: "Average Rating", value: "4.9" },
];

const team = [
  {
    name: "Hezron Macharia",
    role: "Founder & CEO",
    image: "/african-business-man-ceo.jpg",
    bio: "Passionate about showcasing Kenya's beauty to the world",
  },
  {
    name: "Sarah Wanjiku",
    role: "Head of Operations",
    image: "/african-business-woman-operations.jpg",
    bio: "Ensuring every adventure exceeds expectations",
  },
  {
    name: "David Kimani",
    role: "Lead Safari Guide",
    image: "/african-safari-guide.jpg",
    bio: "Expert wildlife guide with 10+ years experience",
  },
];

const values = [
  {
    icon: Heart,
    title: "Passion for Adventure",
    description:
      "We live and breathe adventure, bringing that passion to every experience we create.",
  },
  {
    icon: Globe,
    title: "Sustainable Tourism",
    description:
      "Committed to responsible travel that benefits local communities and preserves nature.",
  },
  {
    icon: Award,
    title: "Excellence in Service",
    description:
      "Delivering exceptional experiences that create lifelong memories for our travelers.",
  },
  {
    icon: Users,
    title: "Community Impact",
    description:
      "Supporting local communities through our charity work and community engagement programs.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              About Kuja Twende Adventures
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Founded in 2019, Kuja Twende Adventures has been at the forefront
              of showcasing Kenya's incredible beauty and rich culture to
              travelers from around the world. Our name means "Come, Let's Go"
              in Swahili, embodying our spirit of adventure and exploration.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Our Story
            </h2>
            <div className="glass rounded-2xl p-8 mb-8">
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Kuja Twende Adventures began as a dream to share the incredible
                beauty of Kenya with the world. Founded by Hezron Macharia along
                the Nairobi-Murang'a Highway, our journey started with simple
                adventures to destinations like Maasai Mara, Amboseli, and
                Mombasa.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Over the years, we've grown from organizing trips every two
                weeks to becoming a trusted name in Kenyan tourism. We've faced
                challenges, celebrated victories, and most importantly, we've
                never lost sight of our mission: to create unforgettable
                experiences that connect people with Kenya's natural wonders and
                rich culture.
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Today, we're proud to have facilitated adventures for over 1000
                travelers, expanded to international destinations like Zanzibar,
                and maintained our commitment to community service through
                charity work and our annual La Cascada event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value) => (
              <div key={value.title} className="glass rounded-2xl p-6">
                <value.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-white/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-cyan-400 mb-3">{member.role}</p>
                <p className="text-white/70 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-white/70 mb-6">
              Join thousands of travelers who have discovered the magic of Kenya
              with Kuja Twende Adventures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/packages">
                <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                  Explore Packages
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:border-cyan-400 bg-transparent"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
