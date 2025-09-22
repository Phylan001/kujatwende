import type { ObjectId } from "mongodb"

export interface Review {
  _id?: ObjectId
  userId: ObjectId
  packageId: ObjectId
  bookingId: ObjectId
  rating: number // 1-5
  title: string
  comment: string
  images?: string[]
  helpful: number
  createdAt: Date
  updatedAt: Date
}
