'use client';

import { useState } from 'react';
import { Property, ListingStatus } from '@/types/database';
import { updatePropertyStatus, deleteProperty } from '@/app/actions/properties';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, CheckCircle, XCircle, Trash2, Edit3, AlertTriangle } from 'lucide-react';

interface PropertyStatusManagerProps {
  property: Property;
}

export default function PropertyStatusManager({ property }: PropertyStatusManagerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ListingStatus>(property.status);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handleStatusChange = async (newStatus: ListingStatus) => {
    setLoading(true);
    setMsg(null);
    const res = await updatePropertyStatus(property.id, newStatus);
    if (res.error) {
      setMsg({ text: res.error, error: true });
    } else {
      setStatus(newStatus);
      setMsg({ text: `Listing status updated to "${newStatus}".`, error: false });
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently remove this property listing?')) {
      return;
    }
    setLoading(true);
    const res = await deleteProperty(property.id);
    if (res.error) {
      setMsg({ text: res.error, error: true });
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-[#13315C] text-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-lg space-y-5">
      <div className="flex items-center justify-between border-b border-[#8DA9C4]/20 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#8DA9C4]" />
          <h3 className="font-heritage text-xl font-bold text-white">
            Estate Management Console
          </h3>
        </div>
        <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#0B2545] text-[#8DA9C4] border border-[#8DA9C4]/30">
          Owner / Agent Controls
        </span>
      </div>

      <p className="text-xs text-[#8DA9C4] leading-relaxed">
        Per REQ-4.2.6, updating status to &quot;Sold&quot; or &quot;Occupied&quot; will mark this listing appropriately in the catalog.
      </p>

      {/* Status Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleStatusChange('published')}
          disabled={loading || status === 'published'}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            status === 'published'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[#0B2545] text-gray-300 hover:text-white hover:bg-[#134074]'
          }`}
        >
          ✓ Active / Published
        </button>

        {property.listing_type === 'sale' ? (
          <button
            onClick={() => handleStatusChange('sold')}
            disabled={loading || status === 'sold'}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              status === 'sold'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#0B2545] text-gray-300 hover:text-white hover:bg-[#134074]'
            }`}
          >
            Mark as Sold
          </button>
        ) : (
          <button
            onClick={() => handleStatusChange('occupied')}
            disabled={loading || status === 'occupied'}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              status === 'occupied'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#0B2545] text-gray-300 hover:text-white hover:bg-[#134074]'
            }`}
          >
            Mark as Occupied
          </button>
        )}

        <button
          onClick={() => handleStatusChange('draft')}
          disabled={loading || status === 'draft'}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            status === 'draft'
              ? 'bg-gray-700 text-white shadow-md'
              : 'bg-[#0B2545] text-gray-300 hover:text-white hover:bg-[#134074]'
          }`}
        >
          Unpublish (Draft)
        </button>

        <Link
          href={`/properties/${property.id}/edit`}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8DA9C4] text-[#0B2545] hover:bg-white transition-all shadow-md flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{status === 'draft' ? 'Edit Draft Listing' : 'Edit Listing'}</span>
        </Link>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-800/40 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Listing</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            msg.error
              ? 'bg-rose-950/60 text-rose-200 border border-rose-800/50'
              : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/50'
          }`}
        >
          {msg.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}
    </div>
  );
}
