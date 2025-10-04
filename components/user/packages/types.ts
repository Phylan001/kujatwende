export interface Destination {
  _id: string;
  name: string;
  slug: string;
  location: {
    region: string;
  };
  packagesCount: number;
}

export interface TravelPackage {
  _id: string;
  name: string;
  slug: string;
  destinationId: string;
  destinationName: string;
  duration: number;
  price: number;
  isFree: boolean;
  description: string;
  image?: {
    url: string;
    publicId: string;
  };
  availableSeats: number;
  totalSeats: number;
  bookedSeats: number;
  startDate: string;
  endDate: string;
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
}