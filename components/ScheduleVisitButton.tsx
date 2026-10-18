'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { createAppointment } from '@/app/actions/appointments';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ScheduleVisitButtonProps {
  propertyId: string;
  hostId: string;
  propertyTitle: string;
}

export default function ScheduleVisitButton({
  propertyId,
  hostId,
  propertyTitle,
}: ScheduleVisitButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM - 12:30 PM (Morning)');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await createAppointment({
      propertyId,
      hostId,
      visitDate: selectedDate,
      timeSlot: selectedSlot,
      notes,
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setConfirmed(true);
      setLoading(false);
      router.refresh();
      setTimeout(() => {
        setConfirmed(false);
        setIsOpen(false);
      }, 2500);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#EEF4F8] text-[#134074] hover:bg-[#8DA9C4]/30 border border-[#8DA9C4]/40 transition-all text-center block"
      >
        Schedule Private Site Visit
      </button>

      {/* Interactive Modal (REQ-4.5.1) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-2xl relative text-[#0B2545]">
            <button
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-[#EEF4F8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {confirmed ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heritage text-2xl font-bold text-[#0B2545]">
                  Site Visit Request Dispatched!
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                  Your appointment proposal for <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong> has been saved and transmitted to the property representative.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    Status: Pending Confirmation (REQ-4.5.3)
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074] mb-1">
                    <Calendar className="w-4 h-4 text-[#8DA9C4]" />
                    <span>Appointment Scheduling</span>
                  </div>
                  <h3 className="font-heritage text-2xl font-bold text-[#0B2545]">
                    Request a Private Viewing
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {propertyTitle}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span>{error}</span>
                      {error.includes('sign in') && (
                        <div className="mt-2">
                          <Link
                            href="/auth/login"
                            className="font-bold underline text-[#134074]"
                          >
                            Sign In / Switch Persona
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#0B2545] mb-1.5">
                    Preferred Visit Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2545] mb-1.5">
                    Preferred Time Slot (REQ-4.5.1)
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074] bg-white"
                  >
                    <option value="10:00 AM - 11:30 AM (Morning)">10:00 AM - 11:30 AM (Morning)</option>
                    <option value="11:30 AM - 01:00 PM (Midday)">11:30 AM - 01:00 PM (Midday)</option>
                    <option value="03:00 PM - 04:30 PM (Afternoon)">03:00 PM - 04:30 PM (Afternoon)</option>
                    <option value="05:00 PM - 06:30 PM (Sunset / Evening)">05:00 PM - 06:30 PM (Sunset / Evening)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2545] mb-1.5">
                    Inquiry Notes / Special Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Planning to visit with architect, specific questions on floor plan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{loading ? 'Submitting Proposal...' : 'Transmit Visit Request'}</span>
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Listing owner/agent will receive in-app notification per REQ-4.5.2
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
