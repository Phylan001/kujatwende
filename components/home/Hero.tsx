"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

// Fallback images stored locally
const FALLBACK_IMAGES = [
  "/samburu-national-reserve-kenya-wildlife.jpg",
  "/lake-nakuru-flamingos-kenya.jpg",
];

interface HeroImage {
  url: string;
  caption?: string;
  type: "destination" | "package";
}

export function Hero() {
  const [heroImages, setHeroImages] = useState<string[]>(FALLBACK_IMAGES);
  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Fetch images from database
    const fetchHeroImages = async () => {
      try {
        const images: string[] = [];

        // Fetch featured destinations
        const destResponse = await fetch(
          "/api/destinations?featured=true&limit=3"
        );
        const destData = await destResponse.json();

        if (destData.success && destData.destinations) {
          destData.destinations.forEach((dest: any) => {
            // Add banner image if exists
            if (dest.bannerImage?.url) {
              images.push(dest.bannerImage.url);
            }
            // Add gallery images if exist
            if (dest.gallery && dest.gallery.length > 0) {
              dest.gallery.forEach((img: any) => {
                if (img.url) images.push(img.url);
              });
            }
          });
        }

        // Fetch featured packages
        const pkgResponse = await fetch("/api/packages?featured=true&limit=3");
        const pkgData = await pkgResponse.json();

        if (pkgData.success && pkgData.packages) {
          pkgData.packages.forEach((pkg: any) => {
            // Add package image if exists
            if (pkg.image?.url) {
              images.push(pkg.image.url);
            }
          });
        }

        // Shuffle images for variety
        const shuffledImages = images.sort(() => Math.random() - 0.5);

        // If we have images from DB, use them; otherwise use fallbacks
        if (shuffledImages.length > 0) {
          // Combine DB images with fallbacks for more variety
          setHeroImages([...shuffledImages, ...FALLBACK_IMAGES]);
        } else {
          setHeroImages(FALLBACK_IMAGES);
        }
      } catch (error) {
        console.error("Error fetching hero images:", error);
        // Keep using fallback images on error
        setHeroImages(FALLBACK_IMAGES);
      }
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    // Smooth image transition with realistic timing
    const interval = setInterval(() => {
      setIsTransitioning(true);

      // Brief transition period
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000); // 8 seconds per image - realistic and engaging

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-26 md:pt-16 pb-24 md:pb-5">
      {/* Background Images with Smooth Parallax Effect */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentImage && !isTransitioning
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={image}
              alt={`Kenya Adventure ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>
        ))}
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
            Explore Kenya Like Never Before
          </h1>
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Embark on extraordinary adventures across Kenya's most breathtaking
            destinations. From the wild savannas of Maasai Mara to the pristine
            beaches of the coast.
          </p>

          {/* Search Bar */}
          <div className="glass rounded-2xl p-6 mb-8 max-w-2xl mx-auto neon-border">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <Link
                href={`/packages${searchQuery ? `?search=${searchQuery}` : ""}`}
              >
                <Button className="w-full md:w-auto bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 px-8 py-3 animate-glow">
                  <Search className="w-5 h-5 mr-2" />
                  Search Adventures
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-cyan-400 mb-1">50+</div>
              <div className="text-white/80 text-sm">Destinations</div>
            </div>
            <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                1000+
              </div>
              <div className="text-white/80 text-sm">Happy Travelers</div>
            </div>
            <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-orange-400 mb-1">5★</div>
              <div className="text-white/80 text-sm">Average Rating</div>
            </div>
          </div>

          {/* Image Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentImage
                    ? "w-8 bg-cyan-400"
                    : "w-4 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
