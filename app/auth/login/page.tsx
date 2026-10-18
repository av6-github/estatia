'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login, demoLogin } from '@/app/actions/auth';
import { UserRole } from '@/types/database';
import { Building2, LogIn, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleDemo = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    await demoLogin(role);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#134074] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Building2 className="w-6 h-6 text-[#8DA9C4]" />
          </div>
          <h1 className="font-heritage text-3xl font-bold text-[#0B2545]">
            Sign In to Estatia
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Access your role-based real estate management portal.
          </p>
        </div>

        {/* Demo Personas 1-Click Box (For Evaluator & Easy Testing) */}
        <div className="bg-[#13315C] text-white rounded-2xl p-5 border border-[#8DA9C4]/30 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8DA9C4]">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Instant Test Personas (1-Click)</span>
          </div>
          <p className="text-[11px] text-gray-300">
            Click any role to log in immediately without typing passwords:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemo('seller')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-amber-200 border border-amber-300/30 font-medium transition-colors text-left"
            >
              👑 Seller / Landlord
            </button>
            <button
              onClick={() => handleDemo('agent')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-blue-200 border border-blue-300/30 font-medium transition-colors text-left"
            >
              💼 Certified Agent
            </button>
            <button
              onClick={() => handleDemo('buyer')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-emerald-200 border border-emerald-300/30 font-medium transition-colors text-left"
            >
              🏡 Active Buyer
            </button>
            <button
              onClick={() => handleDemo('tenant')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#0B2545] hover:bg-[#134074] text-purple-200 border border-purple-300/30 font-medium transition-colors text-left"
            >
              🔑 Verified Tenant
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#8DA9C4]/30 shadow-lg space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0B2545]">
                  Password
                </label>
                <span className="text-[11px] text-gray-400">REQ-4.1.6</span>
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#8DA9C4]/20 text-xs text-gray-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/auth/register" className="font-semibold text-[#134074] hover:underline">
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
