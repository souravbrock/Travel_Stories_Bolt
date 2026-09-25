export interface State {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  best_season: string | null;
  peak_season: string | null;
  highlights: string[];
  image_url: string | null;
  color: string | null;
}

export interface District {
  id: number;
  state_id: number;
  name: string;
  description: string | null;
}

export interface TouristSpot {
  id: number;
  district_id: number;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  entry_fee: string | null;
  visit_duration: string | null;
}

export interface Accommodation {
  id: number;
  tourist_spot_id: number;
  name: string;
  type: string | null;
  tier: string | null;
  price_per_night: number | null;
  rating: number;
  amenities: string[];
  image_url: string | null;
  address: string | null;
}

export interface StateWithDistricts extends State {
  districts: District[];
}

export interface DistrictWithSpots extends District {
  spots: TouristSpot[];
}

export interface SpotWithAccommodations extends TouristSpot {
  accommodations: Accommodation[];
}

export interface NearbySpot {
  spot: TouristSpot;
  distanceKm: number;
  travelTimeMin: number;
}

export interface TravelAgent {
  id: number;
  name: string;
  logo_url: string | null;
  verified: boolean;
  rating: number;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

export interface TravelPackage {
  id: number;
  agent_id: number;
  title: string;
  slug: string;
  description: string | null;
  state_name: string | null;
  duration_days: number | null;
  price: number | null;
  inclusions: string[];
  exclusions: string[];
  itinerary: string[];
  image_url: string | null;
  rating: number;
  category: string | null;
  max_group_size: number | null;
  agent?: TravelAgent;
}
