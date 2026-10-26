import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterProperties,
  validatePropertyDetails,
  toggleFavorite,
  createVisitInquiry,
  evaluateAppointmentStatus,
} from '../lib/services/buyerService.ts';
import type { Property, Appointment } from '../types/database.ts';

const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'The Skyward Sovereign Penthouse',
    description: 'Ultra luxury duplex penthouse in Worli',
    listing_type: 'sale',
    property_type: 'apartment',
    price: 285000000,
    security_deposit: 0,
    address: 'Dr. Annie Besant Rd',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '400018',
    country: 'India',
    area_sqft: 6200,
    bedrooms: 5,
    bathrooms: 6,
    amenities: ['Private Lift', 'Infinity Pool', 'Terrace'],
    status: 'published',
    verification_status: 'verified',
    owner_id: 'seller-1',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
    images: [{ id: 'img-1', property_id: 'prop-1', image_url: 'https://img.com/1.jpg', is_primary: true, display_order: 0, created_at: '' }],
  },
  {
    id: 'prop-2',
    title: 'Serenade Seaside Villa',
    description: 'Beachfront coastal villa in Juhu',
    listing_type: 'sale',
    property_type: 'villa',
    price: 120000000,
    security_deposit: 0,
    address: 'Juhu Tara Rd',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '400049',
    country: 'India',
    area_sqft: 4500,
    bedrooms: 4,
    bathrooms: 5,
    amenities: ['Beach Access', 'Garden'],
    status: 'published',
    verification_status: 'verified',
    owner_id: 'seller-1',
    created_at: '2026-10-02T10:00:00Z',
    updated_at: '2026-10-02T10:00:00Z',
    images: [{ id: 'img-2', property_id: 'prop-2', image_url: 'https://img.com/2.jpg', is_primary: true, display_order: 0, created_at: '' }],
  },
  {
    id: 'prop-3',
    title: 'Cyber Towers Studio',
    description: 'Modern serviced apartment in HITEC City',
    listing_type: 'rent',
    property_type: 'apartment',
    price: 75000,
    security_deposit: 150000,
    address: 'HITEC City Main Rd',
    city: 'Hyderabad',
    state: 'Telangana',
    zip_code: '500081',
    country: 'India',
    area_sqft: 1100,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['Gym', 'Furnished'],
    status: 'published',
    verification_status: 'verified',
    owner_id: 'seller-2',
    created_at: '2026-10-03T10:00:00Z',
    updated_at: '2026-10-03T10:00:00Z',
    images: [{ id: 'img-3', property_id: 'prop-3', image_url: 'https://img.com/3.jpg', is_primary: true, display_order: 0, created_at: '' }],
  },
];

describe('Module 1: Buyer Core Functionality', () => {
  // Test 1: Filter and browse properties (PASS)
  it('TC-BUY-01 [PASS]: Should filter properties by listing type (sale) and city (Mumbai)', () => {
    const results = filterProperties(mockProperties, {
      listing_type: 'sale',
      city: 'Mumbai',
    });

    assert.equal(results.length, 2);
    assert.ok(results.every((p) => p.listing_type === 'sale' && p.city === 'Mumbai'));
  });

  // Test 2: View property details and integrity check (PASS)
  it('TC-BUY-02 [PASS]: Should validate complete display specifications of a selected property', () => {
    const validation = validatePropertyDetails(mockProperties[0]);

    assert.equal(validation.isValid, true);
    assert.equal(validation.missingFields.length, 0);
  });

  // Test 3: Maintain favorites wishlist (PASS)
  it('TC-BUY-03 [PASS]: Should add property to buyer wishlist and remove it when toggled', () => {
    const initialFavorites: string[] = [];
    const added = toggleFavorite(initialFavorites, 'prop-1');

    assert.equal(added.isFavorited, true);
    assert.deepEqual(added.updatedFavorites, ['prop-1']);

    const removed = toggleFavorite(added.updatedFavorites, 'prop-1');
    assert.equal(removed.isFavorited, false);
    assert.deepEqual(removed.updatedFavorites, []);
  });

  // Test 4: Send site visit inquiry and verify status (PASS)
  it('TC-BUY-04 [PASS]: Should create site visit inquiry and initialize with pending status', () => {
    const inquiryResult = createVisitInquiry({
      propertyId: 'prop-1',
      requesterId: 'buyer-user-123',
      hostId: 'seller-user-456',
      visitDate: '2026-10-25',
      timeSlot: '11:00 AM - 12:30 PM (Morning)',
      notes: 'Interested in floorplan viewing.',
    });

    assert.equal(inquiryResult.success, true);
    assert.ok(inquiryResult.appointment);
    assert.equal(inquiryResult.appointment?.status, 'pending');

    const statusEval = evaluateAppointmentStatus(inquiryResult.appointment!);
    assert.equal(statusEval.displayStatus, 'Pending Review');
    assert.equal(statusEval.isActionableByBuyer, false);
  });

  // Test 5: Filter properties by maximum price boundary (INTENTIONAL FAIL)
  it('TC-BUY-05 [FAIL]: Should return properties with price less than or equal to maxPrice boundary', () => {
    // Rental property price is ₹75,000. Filter max_price = 100,000.
    // It should include prop-3.
    const results = filterProperties(mockProperties, {
      listing_type: 'rent',
      max_price: 100000,
    });

    // EXPECTATION: results should contain prop-3 (price 75,000 <= 100,000)
    // ACTUAL: Fails because buyerService has intentional defect where p.price <= max_price returns false!
    assert.equal(
      results.length,
      1,
      'Expected 1 rental property priced under ₹100,000'
    );
    assert.equal(results[0]?.id, 'prop-3');
  });
});
