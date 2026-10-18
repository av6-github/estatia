export type UserRole = 'buyer' | 'tenant' | 'seller' | 'agent' | 'admin';
export type ListingType = 'sale' | 'rent';
export type PropertyType = 'apartment' | 'house' | 'villa' | 'condo' | 'commercial' | 'plot';
export type ListingStatus = 'draft' | 'published' | 'occupied' | 'sold';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type AppointmentStatus = 'pending' | 'confirmed' | 'rescheduled' | 'declined' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  agency_name?: string | null;
  license_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  listing_type: ListingType;
  property_type: PropertyType;
  price: number;
  security_deposit: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  status: ListingStatus;
  verification_status: VerificationStatus;
  owner_id: string;
  agent_id?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  images?: PropertyImage[];
  owner?: Profile;
  agent?: Profile | null;
  is_favorited?: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface AgentLandlord {
  id: string;
  agent_id: string;
  landlord_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  agent?: Profile;
  landlord?: Profile;
}

export interface Appointment {
  id: string;
  property_id: string;
  requester_id: string;
  host_id: string;
  visit_date: string;
  time_slot: string;
  status: AppointmentStatus;
  notes?: string | null;
  alternate_date?: string | null;
  alternate_time_slot?: string | null;
  host_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  property?: Property;
  requester?: Profile;
  host?: Profile;
}
