"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Package,
  Pause,
  Play,
} from "lucide-react";

interface UnifiedReview {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
  user: {
    name: string;
  };
  type: "package" | "destination";
  itemName: string;
}

interface ReviewsResponse {
  success: boolean;
  reviews: UnifiedReview[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  statistics: {
    totalReviews: number;
    averageRating: number;
  };
}

export function Testimonials() {
  const [reviews, setReviews] = useState<UnifiedReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [statistics, setStatistics] = useState({
    totalReviews: 0,
    averageRating: 0,
  });

  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  /**
   * Fetch unified reviews from API
   * Retrieves both package and destination reviews in a single call
   */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          "/api/reviews?limit=12&sortBy=recent"
        );
        const data: ReviewsResponse = await response.json();

        if (data.success && data.reviews) {
          setReviews(data.reviews);
          setStatistics(data.statistics);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  /**
   * Auto-scroll functionality with pause/resume capability
   * Rotates through reviews every 5 seconds when not paused
   */
  useEffect(() => {
    if (!isPaused && reviews.length > 1) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000); // 5 seconds per review
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isPaused, reviews.length]);

  /**
   * Navigation handlers with auto-scroll pause
   */
  const nextReview = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Resume after 10s
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Resume after 10s
  }, [reviews.length]);

  const goToReview = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Resume after 10s
  }, []);

  /**
   * Touch gesture handlers for mobile swipe navigation
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextReview();
      } else {
        prevReview();
      }
    }
  };

  /**
   * Star rating renderer
   */
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    ));
  };

  /**
   * Review type badge renderer
   */
  const renderTypeBadge = (type: "package" | "destination") => {
    const isPackage = type === "package";
    return (
      <Badge
        variant="outline"
        className={`
          ${
            isPackage
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
              : "bg-purple-500/10 text-purple-400 border-purple-500/30"
          }
          text-xs md:text-sm
        `}
      >
        {isPackage ? (
          <>
            <Package className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Package
          </>
        ) : (
          <>
            <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Destination
          </>
        )}
      </Badge>
    );
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              What Our Travelers Say
            </h2>
          </div>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Empty state
   */
  if (reviews.length === 0) {
    return (
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              What Our Travelers Say
            </h2>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto px-4">
              Be the first to share your adventure experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-12 md:py-16 px-4 overflow-hidden">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12 animate-slide-up">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            What Our Travelers Say
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-white/80 max-w-2xl mx-auto px-4">
            Real experiences from adventurers who've explored Kenya with us
          </p>

          {/* Statistics */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 md:mt-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(Math.round(statistics.averageRating))}
              </div>
              <span className="text-white font-semibold text-sm md:text-base">
                {statistics.averageRating.toFixed(1)}
              </span>
            </div>
            <div className="text-white/60 text-xs md:text-sm">
              {statistics.totalReviews} Reviews
            </div>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main Featured Review Card */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="mb-6 md:mb-8"
          >
            <Card className="glass border-white/10 animate-fade-scale hover:border-cyan-400/30 transition-all duration-300">
              <CardContent className="p-4 md:p-6 lg:p-8">
                <div className="text-center">
                  {/* Review Type Badge */}
                  <div className="mb-3 md:mb-4 flex justify-center">
                    {renderTypeBadge(currentReview.type)}
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center justify-center gap-1 mb-3 md:mb-4">
                    {renderStars(currentReview.rating)}
                  </div>

                  {/* Review Title */}
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 md:mb-4 px-2">
                    {currentReview.title}
                  </h3>

                  {/* Item Name */}
                  <p className="text-cyan-400 text-sm md:text-base mb-3 md:mb-4">
                    {currentReview.itemName}
                  </p>

                  {/* Review Comment */}
                  <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4 md:mb-6 max-w-3xl mx-auto px-2">
                    "{currentReview.comment}"
                  </p>

                  {/* User Info */}
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold text-sm md:text-base">
                        {currentReview.user.name}
                      </p>
                      <p className="text-white/60 text-xs md:text-sm">
                        Verified Traveler
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-12">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={prevReview}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent h-8 w-8 md:h-10 md:w-10 p-0"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-1.5 md:gap-2 max-w-[200px] md:max-w-none overflow-x-auto hide-scrollbar px-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReview(index)}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                    index === currentIndex
                      ? "bg-cyan-400 w-6 md:w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={nextReview}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent h-8 w-8 md:h-10 md:w-10 p-0"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            {/* Play/Pause Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent h-8 w-8 md:h-10 md:w-10 p-0 ml-1 md:ml-2"
              aria-label={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
            >
              {isPaused ? (
                <Play className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Pause className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
