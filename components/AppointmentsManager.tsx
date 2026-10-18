'use client';

import { useState } from 'react';
import { Appointment, AppointmentStatus } from '@/types/database';
import { 
  confirmAppointment, 
  proposeAlternateSlot, 
  acceptAlternateSlot, 
  declineAppointment, 
  cancelAppointment 
} from '@/app/actions/appointments';
import { formatPrice } from '@/components/PropertyCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  MapPin, 
  MessageSquare,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface AppointmentsManagerProps {
  appointments: Appointment[];
  mode: 'requester' | 'host';
  emptyMessage?: string;
}

export default function AppointmentsManager({
  appointments,
  mode,
  emptyMessage = 'No site visits scheduled at this time.',
}: AppointmentsManagerProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeCounterId, setActiveCounterId] = useState<string | null>(null);
  const [counterDate, setCounterDate] = useState('');
  const [counterSlot, setCounterSlot] = useState('11:30 AM - 01:00 PM (Midday)');
  const [counterNotes, setCounterNotes] = useState('');
  const [msg, setMsg] = useState<{ id: string; text: string; error?: boolean } | null>(null);

  const handleConfirm = async (id: string) => {
    setLoadingId(id);
    setMsg(null);
    const res = await confirmAppointment(id);
    if (res.error) {
      setMsg({ id, text: res.error, error: true });
    } else {
      setMsg({ id, text: 'Site visit confirmed successfully!', error: false });
      router.refresh();
    }
    setLoadingId(null);
  };

  const handleDecline = async (id: string) => {
    const reason = prompt('Optional: Reason for declining this site visit proposal:');
    if (reason === null) return;
    setLoadingId(id);
    setMsg(null);
    const res = await declineAppointment(id, reason);
    if (res.error) {
      setMsg({ id, text: res.error, error: true });
    } else {
      setMsg({ id, text: 'Visit request declined.', error: false });
      router.refresh();
    }
    setLoadingId(null);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled appointment?')) return;
    setLoadingId(id);
    setMsg(null);
    const res = await cancelAppointment(id);
    if (res.error) {
      setMsg({ id, text: res.error, error: true });
    } else {
      setMsg({ id, text: 'Appointment cancelled.', error: false });
      router.refresh();
    }
    setLoadingId(null);
  };

  const handleAcceptAlternate = async (id: string) => {
    setLoadingId(id);
    setMsg(null);
    const res = await acceptAlternateSlot(id);
    if (res.error) {
      setMsg({ id, text: res.error, error: true });
    } else {
      setMsg({ id, text: 'Alternate slot accepted and confirmed!', error: false });
      router.refresh();
    }
    setLoadingId(null);
  };

  const handleProposeAlternate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setLoadingId(id);
    setMsg(null);
    const res = await proposeAlternateSlot(id, counterDate, counterSlot, counterNotes);
    if (res.error) {
      setMsg({ id, text: res.error, error: true });
    } else {
      setMsg({ id, text: 'Alternate slot proposal transmitted to buyer.', error: false });
      setActiveCounterId(null);
      router.refresh();
    }
    setLoadingId(null);
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#8DA9C4]/20 p-6">
        <Calendar className="w-10 h-10 text-[#8DA9C4] mx-auto mb-2" />
        <p className="font-heritage text-lg font-bold text-[#0B2545]">{emptyMessage}</p>
        <p className="text-xs text-gray-500 mt-1">
          {mode === 'requester'
            ? 'Browse available properties to request private site viewings.'
            : 'Incoming site visit requests from prospective buyers and tenants will appear here.'}
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'rescheduled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">Alternate Proposed</span>;
      case 'declined':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">Declined</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-800">Cancelled</span>;
      case 'pending':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">Pending Review</span>;
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((apt) => {
        const isCountering = activeCounterId === apt.id;
        const otherParty = mode === 'requester' ? apt.host : apt.requester;

        return (
          <div
            key={apt.id}
            className="p-5 rounded-2xl bg-white border border-[#8DA9C4]/30 shadow-sm hover:border-[#134074] transition-all space-y-4"
          >
            {/* Top row: Property Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#8DA9C4]/15 pb-3">
              <div className="flex items-center gap-3">
                {apt.property?.images?.[0]?.image_url && (
                  <div className="relative w-14 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-[#8DA9C4]/20">
                    <img
                      src={apt.property.images[0].image_url}
                      alt={apt.property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <Link
                    href={`/properties/${apt.property_id}`}
                    className="font-heritage text-base font-bold text-[#0B2545] hover:text-[#134074] transition-colors line-clamp-1"
                  >
                    {apt.property?.title || 'Estate Viewing'}
                  </Link>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#8DA9C4]" />
                    <span>{apt.property?.city}, {apt.property?.address}</span>
                  </p>
                </div>
              </div>

              <div className="self-start sm:self-auto flex items-center gap-2">
                {getStatusBadge(apt.status)}
              </div>
            </div>

            {/* Visit Details: Date, Slot, Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#EEF4F8]/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#134074]" />
                  Proposed Date & Time
                </span>
                <p className="font-bold text-[#0B2545]">
                  {new Date(apt.visit_date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-[#134074] font-medium">{apt.time_slot}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#EEF4F8]/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#134074]" />
                  {mode === 'requester' ? 'Estate Representative' : 'Prospective Buyer / Tenant'}
                </span>
                <p className="font-bold text-[#0B2545]">
                  {otherParty?.full_name || 'Verified Participant'}
                </p>
                <p className="text-gray-500 text-[11px]">
                  {otherParty?.email} {otherParty?.phone ? `• ${otherParty.phone}` : ''}
                </p>
              </div>

              {apt.notes && (
                <div className="p-3 rounded-xl bg-[#EEF4F8]/60 space-y-1 sm:col-span-2 md:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#134074]" />
                    Inquiry Notes
                  </span>
                  <p className="text-gray-700 italic text-[11px] line-clamp-2">
                    &quot;{apt.notes}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Counter-proposal notification if status is rescheduled */}
            {apt.status === 'rescheduled' && apt.alternate_date && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>Host Proposed Alternate Slot:</span>
                </div>
                <p>
                  <strong>{new Date(apt.alternate_date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</strong> at <strong>{apt.alternate_time_slot}</strong>
                </p>
                {apt.host_notes && (
                  <p className="text-blue-700 italic text-[11px]">
                    Note from host: &quot;{apt.host_notes}&quot;
                  </p>
                )}

                {mode === 'requester' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleAcceptAlternate(apt.id)}
                      disabled={loadingId === apt.id}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-colors"
                    >
                      Accept Proposed Slot & Confirm
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      disabled={loadingId === apt.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                      Cancel Visit
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notification message banner */}
            {msg && msg.id === apt.id && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  msg.error
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            {/* Inline Counter-proposal form for host */}
            {isCountering && (
              <form
                onSubmit={(e) => handleProposeAlternate(e, apt.id)}
                className="p-4 rounded-xl bg-gray-50 border border-[#8DA9C4]/30 space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#134074] uppercase tracking-wider">
                    Propose Alternate Appointment Slot (REQ-4.5.3)
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCounterId(null)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B2545] mb-1">
                      New Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={counterDate}
                      onChange={(e) => setCounterDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#8DA9C4]/40 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B2545] mb-1">
                      Time Slot *
                    </label>
                    <select
                      value={counterSlot}
                      onChange={(e) => setCounterSlot(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#8DA9C4]/40 bg-white"
                    >
                      <option value="10:00 AM - 11:30 AM (Morning)">10:00 AM - 11:30 AM (Morning)</option>
                      <option value="11:30 AM - 01:00 PM (Midday)">11:30 AM - 01:00 PM (Midday)</option>
                      <option value="03:00 PM - 04:30 PM (Afternoon)">03:00 PM - 04:30 PM (Afternoon)</option>
                      <option value="05:00 PM - 06:30 PM (Sunset / Evening)">05:00 PM - 06:30 PM (Sunset / Evening)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#0B2545] mb-1">
                      Message / Reason for Rescheduling
                    </label>
                    <input
                      type="text"
                      value={counterNotes}
                      onChange={(e) => setCounterNotes(e.target.value)}
                      placeholder="e.g. Host unavailable in morning, afternoon slot available..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[#8DA9C4]/40 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loadingId === apt.id}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C]"
                  >
                    Send Proposal to Buyer
                  </button>
                </div>
              </form>
            )}

            {/* Host action buttons (REQ-4.5.3) */}
            {mode === 'host' && !isCountering && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#8DA9C4]/15">
                {apt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleConfirm(apt.id)}
                      disabled={loadingId === apt.id}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm Visit</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveCounterId(apt.id);
                        setCounterDate(apt.visit_date);
                      }}
                      disabled={loadingId === apt.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#EEF4F8] text-[#134074] hover:bg-[#8DA9C4]/30 border border-[#8DA9C4]/40 transition-colors"
                    >
                      Propose Alternate Slot
                    </button>

                    <button
                      onClick={() => handleDecline(apt.id)}
                      disabled={loadingId === apt.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}

                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(apt.id)}
                    disabled={loadingId === apt.id}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors ml-auto"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            )}

            {/* Requester action buttons (REQ-4.5.4) */}
            {mode === 'requester' && apt.status !== 'cancelled' && apt.status !== 'declined' && apt.status !== 'rescheduled' && (
              <div className="flex justify-end pt-2 border-t border-[#8DA9C4]/15">
                <button
                  onClick={() => handleCancel(apt.id)}
                  disabled={loadingId === apt.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
