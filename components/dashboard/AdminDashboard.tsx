'use client';

import { useState } from 'react';
import { Profile, Property, VerificationStatus } from '@/types/database';
import { verifyProperty, deleteProperty } from '@/app/actions/properties';
import { formatPrice } from '@/components/PropertyCard';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Check, 
  X, 
  AlertTriangle, 
  Eye, 
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminDashboardProps {
  profile: Profile;
  allListings: Property[];
  allUsers: Profile[];
}

export default function AdminDashboard({ profile, allListings, allUsers }: AdminDashboardProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingVerification = allListings.filter((p) => p.verification_status === 'pending');
  const verifiedListings = allListings.filter((p) => p.verification_status === 'verified');

  const handleVerify = async (propertyId: string, status: VerificationStatus) => {
    setLoadingId(propertyId);
    await verifyProperty(propertyId, status);
    setLoadingId(null);
    router.refresh();
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Permanently moderate and delete this listing?')) return;
    setLoadingId(propertyId);
    await deleteProperty(propertyId);
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      
      {/* Admin Title Card */}
      <div className="bg-[#0B2545] text-white p-6 sm:p-8 rounded-3xl border border-[#8DA9C4]/30 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-white">
              Platform Administration Console
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500 text-white">
              Administrator
            </span>
          </div>
          <p className="text-xs text-[#8DA9C4] mt-1">
            Supervise compliance, verify ownership proofs, and moderate platform participants (REQ-4.7).
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
          <p className="font-heritage text-3xl font-bold text-[#0B2545] mt-2">{allUsers.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Across 5 Stakeholder Roles</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Listings</p>
          <p className="font-heritage text-3xl font-bold text-[#0B2545] mt-2">{allListings.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Published & Drafted</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified Titles</p>
          <p className="font-heritage text-3xl font-bold text-emerald-600 mt-2">{verifiedListings.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Legally Authenticated</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#8DA9C4]/30 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Queue</p>
          <p className="font-heritage text-3xl font-bold text-amber-600 mt-2">{pendingVerification.length}</p>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">Requires Admin Review</p>
        </div>
      </div>

      {/* Verification Queue (REQ-4.4.4 & REQ-4.7.1) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-[#8DA9C4]/20 mb-6">
          <div>
            <h3 className="font-heritage text-2xl font-bold text-[#0B2545] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#134074]" />
              <span>Document & Title Verification Queue (REQ-4.4)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and approve or reject property listings to award the &quot;Verified&quot; badge.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
            {pendingVerification.length} Pending
          </span>
        </div>

        {pendingVerification.length === 0 ? (
          <div className="text-center py-10 text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200">
            <Check className="w-8 h-8 mx-auto mb-2" />
            <p className="font-heritage text-lg font-bold">Verification queue is completely clear!</p>
            <p className="text-xs text-emerald-600">All submitted property titles and listings have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#8DA9C4]/20">
            {pendingVerification.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/properties/${item.id}`}
                      className="font-heritage text-base font-bold text-[#0B2545] hover:text-[#134074]"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.city} • {item.address} • {formatPrice(item.price, item.listing_type)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify(item.id, 'verified')}
                    disabled={loadingId === item.id}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Title</span>
                  </button>

                  <button
                    onClick={() => handleVerify(item.id, 'rejected')}
                    disabled={loadingId === item.id}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <Link
                    href={`/properties/${item.id}`}
                    className="p-1.5 text-[#134074] hover:bg-[#EEF4F8] rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm">
        <h3 className="font-heritage text-2xl font-bold text-[#0B2545] mb-2">
          Platform User Accounts Directory (REQ-4.1)
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Registered stakeholder profiles across Buyers, Sellers, Agents, Tenants, and Admins.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#8DA9C4]/30 text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Affiliation / Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8DA9C4]/15">
              {allUsers.map((u) => (
                <tr key={u.id} className="py-3">
                  <td className="py-3 font-semibold text-[#0B2545] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#134074] text-white flex items-center justify-center font-bold text-xs">
                      {u.full_name[0]}
                    </div>
                    <span>{u.full_name}</span>
                  </td>
                  <td className="py-3 text-gray-600">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800'
                          : u.role === 'seller'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'agent'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'tenant'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="py-3 text-gray-500">{u.agency_name || 'Individual'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
