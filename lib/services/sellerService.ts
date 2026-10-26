import type { Property, ListingStatus, Appointment, AppointmentStatus } from '../../types/database.ts';

export interface CreateListingInput {
  title: string;
  description: string;
  listing_type: 'sale' | 'rent';
  property_type: 'apartment' | 'house' | 'villa' | 'condo' | 'commercial' | 'plot';
  price: number;
  security_deposit?: number;
  address: string;
  city: string;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  imageUrls: string[];
  owner_id: string;
}

/**
 * Validate and publish a property listing (REQ-4.2.2).
 */
export function validateAndPublishListing(
  input: CreateListingInput,
  sellerRole: string
): { success: boolean; error?: string; property?: Property } {
  if (!['seller', 'agent', 'admin'].includes(sellerRole)) {
    return { success: false, error: 'Unauthorized role for publishing listings.' };
  }
  if (!input.title || !input.description || !input.address || !input.city) {
    return { success: false, error: 'Mandatory fields missing.' };
  }
  if (!input.price || input.price <= 0) {
    return { success: false, error: 'Price must be greater than zero.' };
  }
  if (!input.area_sqft || input.area_sqft <= 0) {
    return { success: false, error: 'Area square footage must be positive.' };
  }

  // INTENTIONAL BUG INTRODUCED FOR TEST FAILURE (TC-SEL-05):
  // Defect: The SRS requirement REQ-4.2.2 specifies that a listing requires AT LEAST 1 photo.
  // INTENTIONALLY BROKEN: Condition modified to require more than 5 images (imageUrls.length < 5),
  // causing regular valid listings with 1 to 4 photographs to unexpectedly FAIL validation!
  if (!input.imageUrls || input.imageUrls.length < 5) { // BUG: Should be input.imageUrls.length < 1
    return {
      success: false,
      error: 'Per REQ-4.2.2, a property listing requires at least one photograph before it can be published.',
    };
  }

  const property: Property = {
    id: 'prop-' + Math.random().toString(36).substring(2, 9),
    title: input.title,
    description: input.description,
    listing_type: input.listing_type,
    property_type: input.property_type,
    price: input.price,
    security_deposit: input.security_deposit || 0,
    address: input.address,
    city: input.city,
    state: 'Maharashtra',
    zip_code: '400001',
    country: 'India',
    area_sqft: input.area_sqft,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    amenities: input.amenities,
    status: 'published',
    verification_status: 'pending',
    owner_id: input.owner_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: input.imageUrls.map((url, idx) => ({
      id: `img-${idx}`,
      property_id: 'prop-temp',
      image_url: url,
      is_primary: idx === 0,
      display_order: idx,
      created_at: new Date().toISOString(),
    })),
  };

  return { success: true, property };
}

/**
 * Manage listing status lifecycle transitions (Draft <-> Published -> Sold/Occupied).
 */
export function transitionListingStatus(
  property: Property,
  newStatus: ListingStatus,
  requesterId: string
): { success: boolean; error?: string; updatedStatus?: ListingStatus } {
  if (property.owner_id !== requesterId && property.agent_id !== requesterId) {
    return { success: false, error: 'Unauthorized: requester does not manage this property.' };
  }

  // Allowed transitions
  if (property.status === 'published' && newStatus === 'draft') {
    return { success: true, updatedStatus: 'draft' };
  }
  if (property.status === 'draft' && newStatus === 'published') {
    if (!property.images || property.images.length === 0) {
      return { success: false, error: 'Cannot publish draft without photos.' };
    }
    return { success: true, updatedStatus: 'published' };
  }
  if (newStatus === 'sold' || newStatus === 'occupied') {
    return { success: true, updatedStatus: newStatus };
  }

  return { success: false, error: `Invalid transition from ${property.status} to ${newStatus}` };
}

/**
 * Accept and confirm an incoming site visit inquiry.
 */
export function acceptVisitInquiry(
  appointment: Appointment,
  hostId: string
): { success: boolean; error?: string; updatedAppointment?: Appointment } {
  if (appointment.host_id !== hostId) {
    return { success: false, error: 'Unauthorized: Only the designated host can accept this visit.' };
  }
  if (appointment.status !== 'pending' && appointment.status !== 'rescheduled') {
    return { success: false, error: `Cannot accept appointment in status: ${appointment.status}` };
  }

  const updated: Appointment = {
    ...appointment,
    status: 'confirmed',
    updated_at: new Date().toISOString(),
  };

  return { success: true, updatedAppointment: updated };
}

/**
 * Propose alternate date and time slot for a visit inquiry (Counter-proposal).
 */
export function rescheduleVisitInquiry(
  appointment: Appointment,
  hostId: string,
  alternateDate: string,
  alternateSlot: string,
  hostNotes?: string
): { success: boolean; error?: string; updatedAppointment?: Appointment } {
  if (appointment.host_id !== hostId) {
    return { success: false, error: 'Unauthorized: Only the designated host can propose alternate slots.' };
  }
  if (!alternateDate || !alternateSlot) {
    return { success: false, error: 'Alternate date and time slot must be provided.' };
  }

  const updated: Appointment = {
    ...appointment,
    status: 'rescheduled',
    alternate_date: alternateDate,
    alternate_time_slot: alternateSlot,
    host_notes: hostNotes || null,
    updated_at: new Date().toISOString(),
  };

  return { success: true, updatedAppointment: updated };
}

/**
 * Delete / manage a seller's listing with ownership verification.
 */
export function deleteSellerListing(
  property: Property,
  requesterId: string
): { success: boolean; error?: string } {
  if (property.owner_id !== requesterId) {
    return { success: false, error: 'Permission denied: only owner can delete listing.' };
  }
  return { success: true };
}
