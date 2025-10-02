import { ObjectId } from "mongodb";

export interface CloudinaryImage {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
}

export interface GalleryImage extends CloudinaryImage {
  caption?: string;
}

export interface DestinationLocation {
  region: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Destination {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  bannerImage?: CloudinaryImage;
  gallery: GalleryImage[];
  location: DestinationLocation;
  bestTimeToVisit: string;
  highlights: string[];
  activities: string[];
  averageRating: number;
  totalReviews: number;
  packagesCount: number;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelPackage {
  _id: ObjectId;
  name: string;
  slug: string;
  destinationId: ObjectId;
  destinationName: string;
  duration: number;
  price: number;
  isFree: boolean;
  description: string;
  image?: CloudinaryImage;
  availableSeats: number;
  totalSeats: number;
  bookedSeats: number;
  startDate: Date;
  endDate: Date;
  featured: boolean;
  status: "active" | "inactive" | "soldout" | "upcoming";
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  difficulty: "easy" | "moderate" | "challenging";
  category: string;
  minGroupSize: number;
  maxGroupSize: number;
  averageRating: number;
  totalReviews: number;
  requirements: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals?: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDestinationDTO {
  name?: string;
  description?: string;
  region?: string;
  bestTimeToVisit?: string;
  highlights?: string[];
  activities?: string[];
  featured?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  metaDescription?: string;
  keywords?: string[];
}
