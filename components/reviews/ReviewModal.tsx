"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Booking } from "@/lib/models/Booking"

interface ReviewModalProps {
  booking: Booking
  onClose: () => void
  onSuccess: () => void
}

export function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating for your experience.",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !comment.trim()) {
      toast({
        title: "Review details required",
        description: "Please provide a title and comment for your review.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          packageId: booking.packageId,
          bookingId: booking._id,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Review submitted!",
          description: "Thank you for sharing your experience.",
        })
        onSuccess()
        onClose()
      } else {
        toast({
          title: "Review failed",
          description: data.error || "Unable to submit review. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Write a Review
          </DialogTitle>
          <DialogDescription className="text-white/70">Share your experience with other travelers</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-white/80">Overall Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-white/60">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-white/80">Review Title</Label>
            <Input
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-white/80">Your Review</Label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-white/50 text-right">{comment.length}/1000 characters</p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
