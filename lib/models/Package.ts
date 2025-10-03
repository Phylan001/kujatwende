import type { ObjectId } from "mongodb";

/**
 * Travel Package Model
 * Represents a travel package linked to a specific destination
 */
export interface TravelPackage {
  _id?: ObjectId;

  // Basic Information
  name: string;
  slug: string; // URL-friendly identifier
  description: string;

  // Destination Reference
  destinationId: ObjectId; // Links to Destination collection
  destinationName: string; // Denormalized for quick access

  // Package Details
  duration: number; // Duration in days
  price: number; // Price in KES (0 for free packages)
  isFree: boolean; // Flag for free packages

  // Images
  image: {
    publicId: string;
    url: string;
    width: number;
    height: number;
  };

  // Itinerary
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals?: string[]; // e.g., ["Breakfast", "Lunch", "Dinner"]
  }>;

  // Package Features
  inclusions: string[]; // What's included
  exclusions: string[]; // What's not included
  highlights: string[]; // Key highlights

  // Capacity Management
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;

  // Dates
  startDate: Date;
  endDate: Date;

  // Classification
  difficulty: "easy" | "moderate" | "challenging";
  category:
    | "Adventure"
    | "Cultural"
    | "Wildlife"
    | "Beach"
    | "Mountain"
    | "Safari"
    | "Hiking";

  // Group Information
  minGroupSize: number;
  maxGroupSize: number;

  // Ratings
  averageRating: number; // 0-5
  totalReviews: number;

  // Status Flags
  featured: boolean;
  status: "active" | "inactive" | "soldout" | "upcoming";

  // Requirements
  requirements?: string[]; // e.g., "Valid ID", "Travel Insurance"
  ageRestriction?: {
    min: number;
    max?: number;
  };

  // Pricing Breakdown (optional)
  pricingDetails?: {
    basePrice: number;
    taxesAndFees: number;
    discounts?: Array<{
      type: string; // e.g., "Early Bird", "Group"
      amount: number;
      validUntil?: Date;
    }>;
  };

  // SEO
  metaDescription?: string;
  keywords?: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new package
 */
export interface CreatePackageDTO {
  name: string;
  description: string;
  destinationId: string; // ObjectId as string
  duration: number;
  price: number;
  isFree?: boolean;
  totalSeats: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  difficulty: "easy" | "moderate" | "challenging";
  category: string;
  inclusions: string[];
  exclusions: string[];
  highlights?: string[];
  minGroupSize?: number;
  maxGroupSize?: number;
  featured?: boolean;
  requirements?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
  }>;
}

/**
 * DTO for updating a package
 */
export interface UpdatePackageDTO extends Partial<CreatePackageDTO> {
  status?: "active" | "inactive" | "soldout" | "upcoming";
  availableSeats?: number;
}
