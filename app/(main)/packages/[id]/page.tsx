"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  Shield,
  CheckCircle,
} from "lucide-react";
import type { TravelPackage } from "@/lib/models/Package";
import { useAuth } from "@/components/providers/AuthProvider";
import { BookingModal } from "@/components/booking/BookingModal";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [package_, setPackage] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/packages/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.package) {
            setPackage(data.package);
          } else {
            router.push("/packages");
          }
        })
        .catch(() => router.push("/packages"))
        .finally(() => setLoading(false));
    }
  }, [params.id, router]);

  const handleBookNow = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-b-2 border-cyan-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!package_) {
    return null;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={
                    package_.images[currentImageIndex] ||
                    `/placeholder.svg?height=500&width=600&query=${package_.destination}-${package_.category}`
                  }
                  alt={package_.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-cyan-400 to-purple-600 text-white border-0">
                    {package_.category}
                  </Badge>
                </div>
              </div>

              {package_.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {package_.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative overflow-hidden rounded-lg ${
                        currentImageIndex === index
                          ? "ring-2 ring-cyan-400"
                          : ""
                      }`}
                    >
                      <img
                        src={
                          image ||
                          `/placeholder.svg?height=100&width=100&query=${package_.destination}-${index}`
                        }
                        alt={`${package_.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Package Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {package_.title}
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  {package_.description}
                </p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>{package_.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>{package_.duration} days</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Max {package_.maxGroupSize} people</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span>{package_.difficulty}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-white/80">4.8 (124 reviews)</span>
              </div>

              {/* Price and Booking */}
              <Card className="glass border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-cyan-400">
                        KSh {package_.price.toLocaleString()}
                      </div>
                      <div className="text-white/60">per person</div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      Available
                    </Badge>
                  </div>

                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-lg py-6"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book This Adventure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
              <TabsTrigger
                value="itinerary"
                className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                Itinerary
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                What's Included
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary" className="mt-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    Day by Day Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {package_.itinerary?.map((day, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {day.title}
                        </h4>
                        <p className="text-white/70 mb-3">{day.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {day.activities.map((activity, actIndex) => (
                            <Badge
                              key={actIndex}
                              variant="outline"
                              className="border-cyan-400/30 text-cyan-400"
                            >
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {package_.features?.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-white/80"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">Reviews coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-white/70">FAQ section coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && package_ && (
        <BookingModal
          package={package_}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
}
