import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAndPublishListing,
  transitionListingStatus,
  acceptVisitInquiry,
  rescheduleVisitInquiry,
  deleteSellerListing,
} from '../lib/services/sellerService.ts';
import type { Property, Appointment } from '../types/database.ts';

const mockSellerProperty: Property = {
  id: 'prop-101',
  title: 'The Orchard Modernist Residence',
  description: 'Sprawling bungalow with private pool',
  listing_type: 'sale',
  property_type: 'villa',
  price: 275000000,
  security_deposit: 0,
  address: 'Koregaon Park Rd',
  city: 'Pune',
  state: 'Maharashtra',
  zip_code: '411001',
  country: 'India',
  area_sqft: 5200,
  bedrooms: 5,
  bathrooms: 6,
  amenities: ['Pool', 'Solar Power', 'Private Lawn'],
  status: 'published',
  verification_status: 'verified',
  owner_id: 'seller-vikram',
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
  images: [
    { id: 'img-101', property_id: 'prop-101', image_url: 'https://images.com/orchard-1.jpg', is_primary: true, display_order: 0, created_at: '' },
    { id: 'img-102', property_id: 'prop-101', image_url: 'https://images.com/orchard-2.jpg', is_primary: false, display_order: 1, created_at: '' }
  ],
};

const mockIncomingAppointment: Appointment = {
  id: 'apt-909',
  property_id: 'prop-101',
  requester_id: 'buyer-rohan',
  host_id: 'seller-vikram',
  visit_date: '2026-10-24',
  time_slot: '11:00 AM - 12:30 PM (Morning)',
  status: 'pending',
  notes: 'Would like to visit accompanied by family architect.',
  created_at: '2026-10-10T12:00:00Z',
  updated_at: '2026-10-10T12:00:00Z',
};

describe('Module 2: Seller Core Functionality', () => {
  // Test 1: Manage listing status - convert published to draft for editing (PASS)
  it('TC-SEL-01 [PASS]: Should permit seller to transition active listing to draft status for editing', () => {
    const result = transitionListingStatus(mockSellerProperty, 'draft', 'seller-vikram');

    assert.equal(result.success, true);
    assert.equal(result.updatedStatus, 'draft');
  });

  // Test 2: Accept incoming site visit inquiry (PASS)
  it('TC-SEL-02 [PASS]: Should allow seller to accept and confirm a pending site visit inquiry', () => {
    const result = acceptVisitInquiry(mockIncomingAppointment, 'seller-vikram');

    assert.equal(result.success, true);
    assert.ok(result.updatedAppointment);
    assert.equal(result.updatedAppointment?.status, 'confirmed');
  });

  // Test 3: Reschedule visit inquiry with counter-proposal (PASS)
  it('TC-SEL-03 [PASS]: Should allow seller to propose an alternate slot and transition appointment to rescheduled', () => {
    const result = rescheduleVisitInquiry(
      mockIncomingAppointment,
      'seller-vikram',
      '2026-10-26',
      '03:00 PM - 04:30 PM (Afternoon)',
      'Owner unavailable on the 24th; afternoon slot proposed instead.'
    );

    assert.equal(result.success, true);
    assert.ok(result.updatedAppointment);
    assert.equal(result.updatedAppointment?.status, 'rescheduled');
    assert.equal(result.updatedAppointment?.alternate_date, '2026-10-26');
    assert.equal(result.updatedAppointment?.alternate_time_slot, '03:00 PM - 04:30 PM (Afternoon)');
    assert.equal(result.updatedAppointment?.host_notes, 'Owner unavailable on the 24th; afternoon slot proposed instead.');
  });

  // Test 4: Manage property - delete with ownership verification (PASS)
  it('TC-SEL-04 [PASS]: Should verify seller ownership when deleting an owned listing', () => {
    const authResult = deleteSellerListing(mockSellerProperty, 'seller-vikram');
    assert.equal(authResult.success, true);

    const unauthorizedResult = deleteSellerListing(mockSellerProperty, 'intruder-id-999');
    assert.equal(unauthorizedResult.success, false);
    assert.equal(unauthorizedResult.error, 'Permission denied: only owner can delete listing.');
  });

  // Test 5: Publish listing with required fields and photographs (INTENTIONAL FAIL)
  it('TC-SEL-05 [FAIL]: Should successfully publish property listing when provided with 2 valid photographs', () => {
    // A seller submits a valid property with 2 photographs (REQ-4.2.2 requires at least 1)
    const newListingInput = {
      title: 'Marina Promenade Luxury Residence',
      description: 'Exclusive 3 BHK sea-facing apartment.',
      listing_type: 'sale' as const,
      property_type: 'apartment' as const,
      price: 45000000,
      address: 'Marine Drive',
      city: 'Mumbai',
      area_sqft: 2200,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['Sea View', 'Concierge', 'Valet'],
      imageUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      ],
      owner_id: 'seller-vikram',
    };

    const publishResult = validateAndPublishListing(newListingInput, 'seller');

    // EXPECTATION: Listing should publish successfully (success === true) since it has 2 photos >= 1
    // ACTUAL: Fails because sellerService has intentional defect requiring >= 5 photos!
    assert.equal(
      publishResult.success,
      true,
      `Expected publication to succeed with 2 photos, but received error: ${publishResult.error}`
    );
    assert.equal(publishResult.property?.status, 'published');
  });
});
