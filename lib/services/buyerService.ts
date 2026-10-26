import type { Property, ListingStatus, Appointment, AppointmentStatus } from '../../types/database.ts';

export interface PropertyFilterParams {
  listing_type?: 'sale' | 'rent';
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  property_type?: string;
}

export interface VisitInquiryInput {
  propertyId: string;
  requesterId: string;
  hostId: string;
  visitDate: string;
  timeSlot: string;
  notes?: string;
}

/**
 * Filter properties based on search and refinement parameters.
 */
export function filterProperties(
  properties: Property[],
  filters: PropertyFilterParams
): Property[] {
  return properties.filter((p) => {
    if (filters.listing_type && p.listing_type !== filters.listing_type) {
      return false;
    }
    if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    if (filters.min_price !== undefined && p.price < filters.min_price) {
      return false;
    }

    // INTENTIONAL BUG INTRODUCED FOR TEST FAILURE (TC-BUY-05):
    // Defect: The condition uses strict inequality (> instead of <=) or inverted logic,
    // causing properties within the maximum budget to be erroneously filtered out!
    if (filters.max_price !== undefined) {
      // INTENTIONALLY BROKEN: Instead of `p.price > filters.max_price` returning false,
      // it rejects properties whose price is less than or equal to max_price.
      if (p.price <= filters.max_price) {
        return false; // BUG: Should return false when p.price > filters.max_price
      }
    }

    if (filters.bedrooms !== undefined && p.bedrooms < filters.bedrooms) {
      return false;
    }
    if (filters.property_type && p.property_type !== filters.property_type) {
      return false;
    }
    return true;
  });
}

/**
 * Verify property details view integrity for buyers.
 */
export function validatePropertyDetails(property: Property): {
  isValid: boolean;
  missingFields: string[];
} {
  const missing: string[] = [];
  if (!property.id) missing.push('id');
  if (!property.title) missing.push('title');
  if (!property.price || property.price <= 0) missing.push('price');
  if (!property.address) missing.push('address');
  if (!property.city) missing.push('city');
  if (!property.area_sqft || property.area_sqft <= 0) missing.push('area_sqft');

  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
}

/**
 * Manage Buyer's Favorite / Wishlist items.
 */
export function toggleFavorite(
  currentFavorites: string[],
  propertyId: string
): { updatedFavorites: string[]; isFavorited: boolean } {
  if (!propertyId) throw new Error('Invalid property ID');
  const exists = currentFavorites.includes(propertyId);
  if (exists) {
    return {
      updatedFavorites: currentFavorites.filter((id) => id !== propertyId),
      isFavorited: false,
    };
  } else {
    return {
      updatedFavorites: [...currentFavorites, propertyId],
      isFavorited: true,
    };
  }
}

/**
 * Validate and prepare visit inquiry proposal submitted by a buyer.
 */
export function createVisitInquiry(
  input: VisitInquiryInput,
  currentDateStr: string = '2026-10-18'
): { success: boolean; error?: string; appointment?: Appointment } {
  if (!input.propertyId || !input.requesterId || !input.hostId) {
    return { success: false, error: 'Missing mandatory identifiers.' };
  }
  if (!input.visitDate || !input.timeSlot) {
    return { success: false, error: 'Visit date and time slot are required.' };
  }
  if (input.requesterId === input.hostId) {
    return { success: false, error: 'Cannot book a visit on your own property.' };
  }
  if (input.visitDate < currentDateStr) {
    return { success: false, error: 'Visit date cannot be in the past.' };
  }

  const appointment: Appointment = {
    id: 'apt-' + Math.random().toString(36).substring(2, 9),
    property_id: input.propertyId,
    requester_id: input.requesterId,
    host_id: input.hostId,
    visit_date: input.visitDate,
    time_slot: input.timeSlot,
    status: 'pending',
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { success: true, appointment };
}

/**
 * Evaluate status tracking for a buyer regarding an appointment.
 */
export function evaluateAppointmentStatus(appointment: Appointment): {
  displayStatus: string;
  isActionableByBuyer: boolean;
} {
  switch (appointment.status) {
    case 'pending':
      return { displayStatus: 'Pending Review', isActionableByBuyer: false };
    case 'rescheduled':
      return { displayStatus: 'Alternate Slot Proposed', isActionableByBuyer: true };
    case 'confirmed':
      return { displayStatus: 'Confirmed by Host', isActionableByBuyer: false };
    case 'declined':
      return { displayStatus: 'Declined by Host', isActionableByBuyer: false };
    case 'cancelled':
      return { displayStatus: 'Cancelled', isActionableByBuyer: false };
    default:
      return { displayStatus: 'Unknown', isActionableByBuyer: false };
  }
}
