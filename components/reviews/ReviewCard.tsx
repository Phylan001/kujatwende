"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, User } from "lucide-react"
import { format } from "date-fns"

interface ReviewCardProps {
  review: {
    _id: string
    rating: number
    title: string
    comment: string
    images?: string[]
    helpful: number
    createdAt: string
    user: {
      _id: string
      name: string
    }
  }
  onMarkHelpful?: (reviewId: string) => void
}

export function ReviewCard({ review, onMarkHelpful }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
    ))
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-medium">{review.user.name}</h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                <span className="text-white/60 text-sm">{format(new Date(review.createdAt), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{review.rating}/5</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h5 className="text-white font-semibold mb-2">{review.title}</h5>
          <p className="text-white/80 leading-relaxed">{review.comment}</p>
        </div>

        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`Review image ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <ThumbsUp className="w-4 h-4" />
            <span>{review.helpful} people found this helpful</span>
          </div>
          {onMarkHelpful && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkHelpful(review._id)}
              className="text-white/60 hover:text-cyan-400"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Helpful
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
