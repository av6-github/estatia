import { getDashboardData } from '@/app/actions/properties';
import { getCurrentUser } from '@/app/actions/auth';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import AgentDashboard from '@/components/dashboard/AgentDashboard';
import BuyerDashboard from '@/components/dashboard/BuyerDashboard';
import TenantDashboard from '@/components/dashboard/TenantDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import Link from 'next/link';
import { User, LogIn, Sparkles, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-10 border border-[#8DA9C4]/30 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#EEF4F8] text-[#134074] flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-[#8DA9C4]" />
          </div>
          <h1 className="font-heritage text-3xl font-bold text-[#0B2545]">
            Stakeholder Portal Access
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-3 max-w-md mx-auto leading-relaxed">
            Please sign in or select an active test persona from the top navigation bar to access your dedicated role dashboard.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-colors flex items-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#8DA9C4]/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Authenticated Workspace</span>
          </div>
          <h1 className="font-heritage text-3xl sm:text-4xl font-bold text-[#0B2545] capitalize">
            {profile.role} Operational Console
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-gray-500">Active Account:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#134074] text-white shadow-sm">
            {profile.full_name} ({profile.role})
          </span>
        </div>
      </div>

      {/* Render matching Role Dashboard */}
      {profile.role === 'seller' && (
        <SellerDashboard
          profile={profile}
          listings={data?.listings || []}
          appointments={data?.appointments || []}
        />
      )}

      {profile.role === 'agent' && (
        <AgentDashboard
          profile={profile}
          listings={data?.listings || []}
          appointments={data?.appointments || []}
        />
      )}

      {profile.role === 'buyer' && (
        <BuyerDashboard
          profile={profile}
          favorites={data?.favorites || []}
          appointments={data?.appointments || []}
        />
      )}

      {profile.role === 'tenant' && (
        <TenantDashboard
          profile={profile}
          favorites={data?.favorites || []}
          appointments={data?.appointments || []}
        />
      )}

      {profile.role === 'admin' && (
        <AdminDashboard
          profile={profile}
          allListings={data?.allListings || []}
          allUsers={data?.allUsers || []}
        />
      )}

    </div>
  );
}
