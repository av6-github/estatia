'use client';

import { Profile, Property, Appointment } from '@/types/database';
import PropertyCard from '@/components/PropertyCard';
import AppointmentsManager from '@/components/AppointmentsManager';
import Link from 'next/link';
import { Heart, Compass, Search, Sparkles, MapPin, Building2, CheckCircle2, Calendar } from 'lucide-react';

interface BuyerDashboardProps {
  profile: Profile;
  favorites: Property[];
  appointments?: Appointment[];
}

export default function BuyerDashboard({ profile, favorites, appointments = [] }: BuyerDashboardProps) {
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending' || a.status === 'rescheduled').length;

  return (
    <div className="space-y-8">
      
      {/* Welcome & Persona Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#8DA9C4]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#134074] text-white flex items-center justify-center font-bold text-2xl overflow-hidden shadow-md">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              profile.full_name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-[#0B2545]">
                Welcome back, {profile.full_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                Active Buyer
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile.email} • {profile.phone || '+91 Contact Verified'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/properties?listingType=sale"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] shadow-md transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Search Estates</span>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saved Favorites</p>
          <p className="font-heritage text-3xl font-bold text-[#134074] mt-2">{favorites.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Bookmarked Residences</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC & Identity</p>
          <p className="font-heritage text-2xl font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-6 h-6" />
            Verified
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Eligible to make acquisition offers</p>
        </div>

        <div className="bg-[#13315C] text-white p-6 rounded-2xl border border-[#8DA9C4]/40 shadow-sm">
          <p className="text-xs font-semibold text-[#8DA9C4] uppercase tracking-wider">Scheduled Visits</p>
          <p className="font-heritage text-3xl font-bold text-white mt-2">
            {appointments.length} Total
          </p>
          <p className="text-[11px] text-[#8DA9C4] mt-1">
            {confirmedCount} Confirmed • {pendingCount} Pending / Proposed
          </p>
        </div>
      </div>

      {/* Scheduled Site Visits (REQ-4.5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#8DA9C4]/20 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#134074]" />
              <h2 className="font-heritage text-2xl font-bold text-[#0B2545]">
                My Scheduled Site Visits (REQ-4.5)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Review appointment statuses, accept counter-proposed alternate slots, or cancel visits per REQ-4.5.3.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-[#134074] text-white">
            {appointments.length} Appointments
          </span>
        </div>

        <AppointmentsManager
          appointments={appointments}
          mode="requester"
          emptyMessage="You have not requested any site visits yet."
        />
      </div>

      {/* Saved Favorites Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-[#8DA9C4]/20 mb-6">
          <div>
            <h3 className="font-heritage text-2xl font-bold text-[#0B2545]">
              My Saved Wishlist
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Properties you have favorited for comparison and direct inquiries.
            </p>
          </div>

          <Link
            href="/favorites"
            className="text-xs font-semibold text-[#134074] hover:text-[#0B2545]"
          >
            View Full Wishlist →
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-10 h-10 text-[#8DA9C4] mx-auto mb-2" />
            <p className="font-heritage text-xl font-bold text-[#0B2545]">Your wishlist is currently empty</p>
            <p className="text-xs text-gray-500 mt-1">Browse our luxury catalog and save properties you love.</p>
            <Link
              href="/properties"
              className="inline-block mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#134074] text-white"
            >
              Explore Residences
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.slice(0, 3).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
