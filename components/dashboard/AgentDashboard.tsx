'use client';

import { useState } from 'react';
import { Profile, Property, ListingStatus, Appointment } from '@/types/database';
import { formatPrice } from '@/components/PropertyCard';
import { updatePropertyStatus, deleteProperty } from '@/app/actions/properties';
import AppointmentsManager from '@/components/AppointmentsManager';
import Link from 'next/link';
import { 
  Award, 
  PlusCircle, 
  Building2, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  Users,
  Edit,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgentDashboardProps {
  profile: Profile;
  listings: Property[];
  appointments?: Appointment[];
}

export default function AgentDashboard({ profile, listings, appointments = [] }: AgentDashboardProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activeCount = listings.filter((p) => p.status === 'published').length;
  const closedCount = listings.filter((p) => p.status === 'sold' || p.status === 'occupied').length;

  const handleStatusChange = async (propertyId: string, status: ListingStatus) => {
    setLoadingId(propertyId);
    await updatePropertyStatus(propertyId, status);
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      
      {/* Agent Credentials Header Card */}
      <div className="bg-[#13315C] text-white p-6 sm:p-8 rounded-3xl border border-[#8DA9C4]/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0B2545] border border-[#8DA9C4]/40 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <Award className="w-8 h-8 text-[#8DA9C4]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-white">
                {profile.full_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#8DA9C4] text-[#0B2545]">
                Certified Agent
              </span>
            </div>
            <p className="text-xs text-[#8DA9C4] mt-1 font-medium">
              {profile.agency_name || 'Estatia Premier Advisory'} • License: {profile.license_number || 'RERA-PRM-2024-8891'}
            </p>
          </div>
        </div>

        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#8DA9C4] text-[#0B2545] hover:bg-white transition-all shadow-md self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Client Estate</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Managed Listings</p>
          <p className="font-heritage text-3xl font-bold text-[#0B2545] mt-2">{listings.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Total Assigned Estates</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active in Market</p>
          <p className="font-heritage text-3xl font-bold text-emerald-600 mt-2">{activeCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Generating Buyer Inquiries</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Closures</p>
          <p className="font-heritage text-3xl font-bold text-amber-600 mt-2">{closedCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Sold or Leased</p>
        </div>
      </div>

      {/* Incoming Site Visit Requests (REQ-4.5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#8DA9C4]/20 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#134074]" />
              <h2 className="font-heritage text-2xl font-bold text-[#0B2545]">
                Client Estate Visit Requests (REQ-4.5)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Confirm visits, suggest alternate slots, or manage viewings for properties you represent per REQ-4.5.3.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-[#134074] text-white">
            {appointments.filter((a) => a.status === 'pending').length} Pending Review
          </span>
        </div>

        <AppointmentsManager
          appointments={appointments}
          mode="host"
          emptyMessage="No incoming site visit requests for your represented estates currently."
        />
      </div>

      {/* Managed Client Properties Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm">
        <h3 className="font-heritage text-2xl font-bold text-[#0B2545] mb-2">
          Assigned Client Portfolio
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Coordinate client listings across multiple owners per REQ-4.1.7 and REQ-4.2.3.
        </p>

        {listings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-[#8DA9C4] mx-auto mb-3" />
            <p className="font-heritage text-xl font-bold text-[#0B2545]">No estates assigned currently</p>
            <p className="text-xs text-gray-500 mt-1">List a property to begin representing landlord assets.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#8DA9C4]/20">
            {listings.map((item) => (
              <div key={item.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-[#8DA9C4]/30">
                    <img
                      src={
                        item.images?.[0]?.image_url ||
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/properties/${item.id}`}
                        className="font-heritage text-base font-bold text-[#0B2545] hover:text-[#134074] transition-colors"
                      >
                        {item.title}
                      </Link>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8DA9C4]" />
                      <span>{item.city}, {item.address}</span>
                      <span className="mx-1.5">•</span>
                      <strong className="text-[#134074]">{formatPrice(item.price, item.listing_type)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(item.id, item.status === 'published' ? 'draft' : 'published')}
                    disabled={loadingId === item.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EEF4F8] text-[#134074] hover:bg-[#134074] hover:text-white transition-colors"
                  >
                    {item.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <Link
                    href={`/properties/${item.id}/edit`}
                    className="p-1.5 text-[#134074] hover:bg-[#EEF4F8] rounded-lg transition-colors"
                    title="Edit listing details"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/properties/${item.id}`}
                    className="p-1.5 text-[#134074] hover:bg-[#EEF4F8] rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
