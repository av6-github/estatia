'use client';

import { Profile, Property, Appointment } from '@/types/database';
import PropertyCard from '@/components/PropertyCard';
import AppointmentsManager from '@/components/AppointmentsManager';
import Link from 'next/link';
import { Key, Compass, Search, MapPin, Building2, CheckCircle2, ShieldCheck, Calendar } from 'lucide-react';

interface TenantDashboardProps {
  profile: Profile;
  favorites: Property[];
  appointments?: Appointment[];
}

export default function TenantDashboard({ profile, favorites, appointments = [] }: TenantDashboardProps) {
  const rentalFavorites = favorites.filter((f) => f.listing_type === 'rent');

  return (
    <div className="space-y-8">
      
      {/* Welcome Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#8DA9C4]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#13315C] text-white flex items-center justify-center font-bold text-2xl overflow-hidden shadow-md">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              profile.full_name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-[#0B2545]">
                {profile.full_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                Verified Tenant
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile.email} • Lease Inquirer
            </p>
          </div>
        </div>

        <Link
          href="/properties?listingType=rent"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] shadow-md transition-all self-start md:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Browse Rental Residences</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saved Rental Homes</p>
          <p className="font-heritage text-3xl font-bold text-[#134074] mt-2">{rentalFavorites.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Shortlisted for Lease</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant Profile Status</p>
          <p className="font-heritage text-2xl font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6" />
            Pre-Screened
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Verified background and credentials</p>
        </div>

        <div className="bg-[#13315C] text-white p-6 rounded-2xl border border-[#8DA9C4]/40 shadow-sm">
          <p className="text-xs font-semibold text-[#8DA9C4] uppercase tracking-wider">Scheduled Visits</p>
          <p className="font-heritage text-3xl font-bold text-white mt-2">{appointments.length} Total</p>
          <p className="text-[11px] text-[#8DA9C4] mt-1">Inspection appointments</p>
        </div>
      </div>

      {/* Scheduled Site Visits (REQ-4.5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#8DA9C4]/20 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#134074]" />
              <h2 className="font-heritage text-2xl font-bold text-[#0B2545]">
                My Rental Inspection Appointments (REQ-4.5)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Review statuses, accept alternate dates from landlords, or manage rental viewing appointments.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-[#134074] text-white">
            {appointments.length} Visits
          </span>
        </div>

        <AppointmentsManager
          appointments={appointments}
          mode="requester"
          emptyMessage="You have not requested any rental inspections yet."
        />
      </div>

      {/* Saved Rentals */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm">
        <h3 className="font-heritage text-2xl font-bold text-[#0B2545] mb-2">
          Shortlisted Rental Residences
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          High-end serviced apartments and furnished residences saved in your profile.
        </p>

        {rentalFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-10 h-10 text-[#8DA9C4] mx-auto mb-2" />
            <p className="font-heritage text-xl font-bold text-[#0B2545]">No rentals shortlisted yet</p>
            <p className="text-xs text-gray-500 mt-1">Explore our curated lease opportunities.</p>
            <Link
              href="/properties?listingType=rent"
              className="inline-block mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#134074] text-white"
            >
              Browse Rental Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentalFavorites.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
