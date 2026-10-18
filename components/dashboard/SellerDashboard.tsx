'use client';

import { useState } from 'react';
import { Profile, Property, ListingStatus, Appointment } from '@/types/database';
import { formatPrice } from '@/components/PropertyCard';
import { updatePropertyStatus, deleteProperty } from '@/app/actions/properties';
import AppointmentsManager from '@/components/AppointmentsManager';
import Link from 'next/link';
import { 
  Building2, 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink,
  Edit,
  Eye,
  ShieldCheck,
  MapPin,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SellerDashboardProps {
  profile: Profile;
  listings: Property[];
  appointments?: Appointment[];
}

export default function SellerDashboard({ profile, listings, appointments = [] }: SellerDashboardProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const totalValue = listings.reduce((sum, p) => sum + Number(p.price), 0);
  const activeCount = listings.filter((p) => p.status === 'published').length;
  const soldCount = listings.filter((p) => p.status === 'sold' || p.status === 'occupied').length;

  const handleStatusChange = async (propertyId: string, status: ListingStatus) => {
    setLoadingId(propertyId);
    await updatePropertyStatus(propertyId, status);
    setLoadingId(null);
    router.refresh();
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setLoadingId(propertyId);
    await deleteProperty(propertyId);
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Portfolio</p>
          <p className="font-heritage text-3xl font-bold text-[#0B2545] mt-2">{listings.length}</p>
          <p className="text-[11px] text-[#134074] mt-1 font-medium">Owned Properties</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Published</p>
          <p className="font-heritage text-3xl font-bold text-emerald-600 mt-2">{activeCount}</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">Visible in public search</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sold / Occupied</p>
          <p className="font-heritage text-3xl font-bold text-amber-600 mt-2">{soldCount}</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">Completed deals</p>
        </div>

        <div className="bg-[#13315C] text-white p-6 rounded-2xl border border-[#8DA9C4]/40 shadow-sm">
          <p className="text-xs font-semibold text-[#8DA9C4] uppercase tracking-wider">Catalog Valuation</p>
          <p className="font-heritage text-2xl font-bold text-white mt-2">
            ₹{(totalValue / 10000000).toFixed(1)} Cr
          </p>
          <p className="text-[11px] text-[#8DA9C4] mt-1">Aggregate Asset Value</p>
        </div>
      </div>

      {/* Incoming Site Visit Requests (REQ-4.5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#8DA9C4]/20 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#134074]" />
              <h2 className="font-heritage text-2xl font-bold text-[#0B2545]">
                Site Visit Inquiries (REQ-4.5)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Confirm visits, propose alternate slots, or decline proposals from prospective buyers per REQ-4.5.3.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-[#134074] text-white">
            {appointments.filter((a) => a.status === 'pending').length} Pending Review
          </span>
        </div>

        <AppointmentsManager
          appointments={appointments}
          mode="host"
          emptyMessage="No incoming site visit requests for your properties currently."
        />
      </div>

      {/* Main Listing Table / Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#8DA9C4]/20 gap-4">
          <div>
            <h2 className="font-heritage text-2xl font-bold text-[#0B2545]">
              My Property Listings
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Control status lifecycles (Draft, Published, Occupied, Sold) per REQ-4.2.6.
            </p>
          </div>

          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] shadow-md transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Listing</span>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-[#8DA9C4] mx-auto mb-3" />
            <p className="font-heritage text-xl font-bold text-[#0B2545]">No listings posted yet</p>
            <p className="text-xs text-gray-500 mt-1">Click the button above to publish your first estate.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#8DA9C4]/20 mt-4">
            {listings.map((item) => (
              <div key={item.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Thumbnail & Info */}
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

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'sold'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'occupied'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
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

                {/* Quick Status Toggles & Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {item.status !== 'published' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'published')}
                      disabled={loadingId === item.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      Publish
                    </button>
                  )}

                  {item.listing_type === 'sale' && item.status !== 'sold' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'sold')}
                      disabled={loadingId === item.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                    >
                      Mark as Sold
                    </button>
                  )}

                  {item.listing_type === 'rent' && item.status !== 'occupied' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'occupied')}
                      disabled={loadingId === item.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                      Mark as Occupied
                    </button>
                  )}

                  {item.status !== 'draft' ? (
                    <button
                      onClick={() => handleStatusChange(item.id, 'draft')}
                      disabled={loadingId === item.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      title="Move to draft to edit"
                    >
                      Make Draft
                    </button>
                  ) : (
                    <Link
                      href={`/properties/${item.id}/edit`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Draft</span>
                    </Link>
                  )}

                  {item.status !== 'draft' && (
                    <Link
                      href={`/properties/${item.id}/edit`}
                      className="p-1.5 text-[#134074] hover:bg-[#EEF4F8] rounded-lg transition-colors"
                      title="Edit listing details"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  )}

                  <Link
                    href={`/properties/${item.id}`}
                    className="p-1.5 text-[#134074] hover:bg-[#EEF4F8] rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={loadingId === item.id}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
