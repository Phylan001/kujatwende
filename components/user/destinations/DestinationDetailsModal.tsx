"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Calendar, Image as ImageIcon } from "lucide-react";

interface Destination {
  _id: string;
  name: string;
  description: string;
  bannerImage?: {
    url: string;
  };
  location: {
    region: string;
  };
  averageRating: number;
  totalReviews: number;
  packagesCount: number;
  featured: boolean;
  highlights: string[];
  activities: string[];
  bestTimeToVisit: string;
  gallery: Array<{
    url: string;
    caption?: string;
  }>;
}

interface DestinationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
  onReviewSubmit: (reviewData: {
    rating: number;
    comment: string;
    title: string;
  }) => void;
}

export default function DestinationDetailsModal({
  isOpen,
  onClose,
  destination,
  onReviewSubmit,
}: DestinationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "review">("details");
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!destination) return null;

  const handleSubmitReview = async () => {
    if (rating === 0 || !reviewTitle.trim() || !reviewComment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onReviewSubmit({
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      // Reset form
      setRating(0);
      setReviewTitle("");
      setReviewComment("");
      setActiveTab("details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{destination.name}</DialogTitle>
          <DialogDescription className="text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {destination.location.region}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "details"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Destination Details
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "review"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400"
            }`}
            onClick={() => setActiveTab("review")}
          >
            Write a Review
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Banner Image */}
            {destination.bannerImage?.url && (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img
                  src={destination.bannerImage.url}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rating and Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white font-medium">
                  {destination.averageRating.toFixed(1)}
                </span>
                <span className="text-slate-400 text-sm">
                  ({destination.totalReviews} reviews)
                </span>
              </div>
              {destination.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  Featured
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-lg">
                About {destination.name}
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* Best Time to Visit */}
            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Best Time to Visit
              </h4>
              <p className="text-slate-300">{destination.bestTimeToVisit}</p>
            </div>

            {/* Highlights */}
            {destination.highlights?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {destination.highlights.map((highlight, index) => (
                    <Badge
                      key={index}
                      className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Activities */}
            {destination.activities?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Activities</h4>
                <div className="flex flex-wrap gap-2">
                  {destination.activities.map((activity, index) => (
                    <Badge
                      key={index}
                      className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery - Fixed null/undefined check */}
            {destination.gallery && destination.gallery.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">
                  Gallery ({destination.gallery.length} images)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {destination.gallery.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden group"
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "review" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-semibold mb-5">
                Share Your Experience
              </h4>

              {/* Rating */}
              <div className="space-y-2 mb-5">
                <Label htmlFor="rating">Your Rating *</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "text-yellow-400 fill-current"
                            : "text-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-2 mb-5">
                <Label htmlFor="reviewTitle">Review Title *</Label>
                <Input
                  id="reviewTitle"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Summarize your experience"
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-2 mb-5">
                <Label htmlFor="reviewComment">Your Review *</Label>
                <Textarea
                  id="reviewComment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                  placeholder="Share details of your experience at this destination..."
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={
                  isSubmitting ||
                  rating === 0 ||
                  !reviewTitle.trim() ||
                  !reviewComment.trim()
                }
                className="w-full btn-adventure"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
