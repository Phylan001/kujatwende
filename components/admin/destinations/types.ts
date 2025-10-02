export interface Destination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage?: {
    url: string;
    publicId: string;
  };
  gallery: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  location: {
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  bestTimeToVisit: string;
  highlights: string[];
  activities: string[];
  averageRating: number;
  totalReviews: number;
  packagesCount: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface FormData {
  name: string;
  description: string;
  region: string;
  bestTimeToVisit: string;
  highlights: string;
  activities: string;
  featured: boolean;
  latitude: string;
  longitude: string;
  metaDescription: string;
  keywords: string;
}