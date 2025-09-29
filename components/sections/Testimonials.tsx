"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, User } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews?limit=6")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              What Our Travelers Say
            </h2>
          </div>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              What Our Travelers Say
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Be the first to share your adventure experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            What Our Travelers Say
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Real experiences from adventurers who've explored Kenya with us
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Review Display */}
          <Card className="glass border-white/10 mb-8 animate-fade-scale">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {renderStars(reviews[currentIndex]?.rating || 0)}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {reviews[currentIndex]?.title}
                </h3>
                <p className="text-white/80 leading-relaxed mb-6 max-w-2xl mx-auto">
                  "{reviews[currentIndex]?.comment}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {reviews[currentIndex]?.user.name}
                    </p>
                    <p className="text-white/60 text-sm">Verified Traveler</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevReview}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-cyan-400" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextReview}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Review Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {reviews.slice(0, 3).map((review, index) => (
              <Card
                key={review._id}
                className="glass border-white/10 hover:border-cyan-400/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(review.rating)}
                  </div>
                  <h4 className="text-white font-semibold mb-2 line-clamp-1">
                    {review.title}
                  </h4>
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {review.comment}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/80 text-sm">
                      {review.user.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
