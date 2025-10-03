import type { ObjectId } from "mongodb";

/**
 * Destination Model
 * Represents a travel destination in Kenya with associated metadata
 */
export interface Destination {
  _id?: ObjectId;
  name: string;
  slug: string; // URL-friendly version of name (e.g., "maasai-mara")
  description: string;

  // Image Management
  bannerImage: {
    publicId: string; // Cloudinary public_id for deletion
    url: string; // Cloudinary secure_url
    width: number;
    height: number;
  };

  gallery: Array<{
    publicId: string;
    url: string;
    width: number;
    height: number;
    caption?: string;
  }>;

  // Ratings and Reviews
  averageRating: number; // 0-5, calculated from reviews
  totalReviews: number; // Count of reviews

  // Metadata
  location: {
    region: string; // e.g., "Rift Valley", "Coast", "Central"
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Travel Information
  bestTimeToVisit: string; // e.g., "July - October"
  highlights: string[]; // Key attractions
  activities: string[]; // Available activities

  // Package Statistics
  packagesCount: number; // Number of packages for this destination

  // Status
  featured: boolean;
  active: boolean;

  // SEO
  metaDescription?: string;
  keywords?: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new destination
 */
export interface CreateDestinationDTO {
  name: string;
  description: string;
  region: string;
  bestTimeToVisit: string;
  highlights: string[];
  activities: string[];
  featured?: boolean;
  metaDescription?: string;
  keywords?: string[];
}

/**
 * DTO for updating a destination
 */
export interface UpdateDestinationDTO extends Partial<CreateDestinationDTO> {
  active?: boolean;
}
