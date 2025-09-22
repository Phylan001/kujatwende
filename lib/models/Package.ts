import type { ObjectId } from "mongodb"

export interface TravelPackage {
  _id?: ObjectId
  title: string
  description: string
  destination: string
  duration: number // days
  price: number
  images: string[]
  features: string[]
  itinerary: {
    day: number
    title: string
    description: string
    activities: string[]
  }[]
  maxGroupSize: number
  difficulty: "Easy" | "Moderate" | "Challenging"
  category: "Adventure" | "Cultural" | "Wildlife" | "Beach" | "Mountain"
  available: boolean
  createdAt: Date
  updatedAt: Date
}
