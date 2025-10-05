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
import {
  Star,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";

interface TravelPackage {
  _id: string;
  name: string;
  description: string;
  destinationName: string;
  duration: number;
  price: number;
  isFree: boolean;
  image?: { url: string };
  availableSeats: number;
  totalSeats: number;
  startDate: string;
  endDate: string;
  featured: boolean;
  status: string;
  difficulty: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
  }>;
  requirements?: string[];
}

interface PackageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: TravelPackage | null;
  onReviewSubmit: (reviewData: {
    rating: number;
    comment: string;
    title: string;
  }) => void;
}

export default function PackageDetailsModal({
  isOpen,
  onClose,
  package: pkg,
  onReviewSubmit,
}: PackageDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "review">("details");
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{pkg.name}</DialogTitle>
          <DialogDescription className="text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {pkg.destinationName}
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
            Package Details
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
            {/* Package Image */}
            {pkg.image?.url && (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img
                  src={pkg.image.url}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rating and Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white font-medium">
                  {pkg.averageRating.toFixed(1)}
                </span>
                <span className="text-slate-400 text-sm">
                  ({pkg.totalReviews} reviews)
                </span>
              </div>
              {pkg.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  Featured
                </Badge>
              )}
              <Badge
                className={
                  pkg.isFree
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-green-500/20 text-green-400"
                }
              >
                {pkg.isFree ? "FREE" : `KSh ${pkg.price.toLocaleString()}`}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-lg">
                About This Package
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {pkg.description}
              </p>
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Duration & Dates
                  </h4>
                  <div className="text-slate-300 space-y-1">
                    <p>{pkg.duration} days</p>
                    <p>Start: {formatDate(pkg.startDate)}</p>
                    <p>End: {formatDate(pkg.endDate)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Group Information
                  </h4>
                  <div className="text-slate-300 space-y-1">
                    <p>
                      Available seats: {pkg.availableSeats}/{pkg.totalSeats}
                    </p>
                    <p>
                      Difficulty:{" "}
                      <span className="capitalize">{pkg.difficulty}</span>
                    </p>
                    <p>Category: {pkg.category}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Inclusions */}
                {pkg.inclusions?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">
                      What's Included
                    </h4>
                    <ul className="text-slate-300 list-disc list-inside space-y-1">
                      {pkg.inclusions.map((inclusion, index) => (
                        <li key={index}>{inclusion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exclusions */}
                {pkg.exclusions?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2">
                      What's Not Included
                    </h4>
                    <ul className="text-slate-300 list-disc list-inside space-y-1">
                      {pkg.exclusions.map((exclusion, index) => (
                        <li key={index}>{exclusion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            {pkg.highlights?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {pkg.highlights.map((highlight, index) => (
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

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Itinerary</h4>
                <div className="space-y-4">
                  {pkg.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="bg-slate-700/30 rounded-lg p-4"
                    >
                      <h5 className="text-orange-400 font-semibold mb-2">
                        Day {day.day}: {day.title}
                      </h5>
                      <p className="text-slate-300 mb-2">{day.description}</p>
                      {day.activities?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {day.activities.map((activity, index) => (
                            <Badge
                              key={index}
                              className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs"
                            >
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {pkg.requirements && pkg.requirements.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Requirements</h4>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  {pkg.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
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
                  placeholder="Share details of your experience with this package..."
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
