'use client';

import { useState } from 'react';
import Link from 'next/link';
import { register } from '@/app/actions/auth';
import { UserRole } from '@/types/database';
import { Building2, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('role', role);

    const res = await register(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#134074] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Building2 className="w-6 h-6 text-[#8DA9C4]" />
          </div>
          <h1 className="font-heritage text-3xl font-bold text-[#0B2545]">
            Create an Estatia Account
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Select your role to access customized real estate actions (REQ-4.1.1).
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#8DA9C4]/30 shadow-lg space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold text-[#0B2545] mb-2">
                Select Your System Stakeholder Role *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'buyer', label: 'Buyer', desc: 'Acquire' },
                  { id: 'tenant', label: 'Tenant', desc: 'Lease' },
                  { id: 'seller', label: 'Seller', desc: 'List' },
                  { id: 'agent', label: 'Agent', desc: 'Advise' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as UserRole)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      role === r.id
                        ? 'bg-[#134074] text-white border-[#134074] shadow-sm'
                        : 'bg-[#EEF4F8]/50 text-[#13315C] border-[#8DA9C4]/30 hover:bg-[#EEF4F8]'
                    }`}
                  >
                    <p className="font-bold text-xs capitalize">{r.label}</p>
                    <p className={`text-[10px] mt-0.5 ${role === r.id ? 'text-[#8DA9C4]' : 'text-gray-400'}`}>
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="e.g. Vikramaditya Singhania"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                Phone Number (REQ-4.1.1)
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98200 00000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
            </div>

            {/* Agent Specific Fields */}
            {role === 'agent' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#8DA9C4]/20 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    name="agency_name"
                    placeholder="e.g. Estatia Premier Advisory"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                    RERA / License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    placeholder="e.g. RERA-PRM-2024-8891"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                Password * (minimum 6 characters)
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#8DA9C4]/20 text-xs text-gray-500">
            Already registered?{' '}
            <Link href="/auth/login" className="font-semibold text-[#134074] hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
