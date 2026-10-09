export interface ListingImage {
  id: number;
  url: string;
  position: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string | null;
}

export interface Listing {
  id: number;
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  location: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  review_count: number;
  latitude?: number | null;
  longitude?: number | null;
  images?: ListingImage[];
  amenities?: Amenity[];
}