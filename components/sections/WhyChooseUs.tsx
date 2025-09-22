import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, MapPin, Star, Clock, Headphones } from "lucide-react"

export function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your safety is our priority with experienced guides and comprehensive insurance coverage.",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      icon: Users,
      title: "Expert Guides",
      description: "Local experts who know every trail, story, and hidden gem across Kenya.",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      icon: MapPin,
      title: "Unique Destinations",
      description: "Access to exclusive locations and off-the-beaten-path adventures.",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "Luxury accommodations and world-class service throughout your journey.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock assistance before, during, and after your adventure.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
    },
    {
      icon: Headphones,
      title: "Personalized Service",
      description: "Tailored experiences designed around your preferences and interests.",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Why Choose Kuja Twende?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We're not just a travel agency - we're your gateway to extraordinary Kenyan adventures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass border-white/10 hover:border-cyan-400/30 transition-all duration-300 group animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">1000+</div>
            <div className="text-white/70">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">50+</div>
            <div className="text-white/70">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">5★</div>
            <div className="text-white/70">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-white/70">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}
