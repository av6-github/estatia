import Link from 'next/link';
import Image from 'next/image';
import { getProperties } from '@/app/actions/properties';
import PropertyCard from '@/components/PropertyCard';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Key, 
  Award, 
  Users 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredProperties = await getProperties({ status: 'published' });

  return (
    <div className="flex flex-col gap-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0B2545] text-white">
        {/* Background Architectural Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&auto=format&fit=crop&q=85"
            alt="Estatia Luxury Architecture"
            fill
            priority
            className="object-cover opacity-35 scale-105 animate-in fade-in zoom-in-50 duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545] via-[#0B2545]/70 to-[#0B2545]/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-24 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#13315C]/80 border border-[#8DA9C4]/40 text-[#8DA9C4] text-xs font-semibold tracking-widest uppercase mb-8 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>The Premier Real Estate Management System</span>
          </div>

          <h1 className="font-heritage text-5xl sm:text-7xl lg:text-8xl font-normal tracking-wide text-white leading-tight">
            The Heritage Legacy
          </h1>

          <p className="mt-4 font-heritage text-2xl sm:text-3xl italic text-[#8DA9C4] max-w-2xl font-light">
            Curated Architectural Residences, Penthouses, & Prime Estates
          </p>

          <p className="mt-6 text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
            Estatia unifies property listings, authenticated title verifications, seamless search, and direct site-visit scheduling for discerning buyers, sellers, tenants, and certified agents.
          </p>

          {/* Quick Search Card */}
          <div className="mt-10 w-full max-w-3xl bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl border border-[#8DA9C4]/30 text-[#0B2545]">
            <form action="/properties" method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#134074] mb-1">
                  Location or Metro
                </label>
                <input
                  type="text"
                  name="query"
                  placeholder="e.g. Worli, Indiranagar, Goa, Delhi..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#8DA9C4]/40 bg-[#EEF4F8]/50 focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#134074] mb-1">
                  Category
                </label>
                <select
                  name="listingType"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#8DA9C4]/40 bg-[#EEF4F8]/50 focus:outline-none focus:border-[#134074]"
                >
                  <option value="all">All Available</option>
                  <option value="sale">For Purchase</option>
                  <option value="rent">For Lease / Rent</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Explore</span>
                </button>
              </div>
            </form>
          </div>

          {/* Metric Highlights */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 text-center border-t border-[#8DA9C4]/20 pt-8 w-full max-w-4xl">
            <div>
              <p className="font-heritage text-3xl font-bold text-white">₹500+ Cr</p>
              <p className="text-[11px] text-[#8DA9C4] uppercase tracking-wider mt-1">Portfolio Value</p>
            </div>
            <div>
              <p className="font-heritage text-3xl font-bold text-white">100%</p>
              <p className="text-[11px] text-[#8DA9C4] uppercase tracking-wider mt-1">Verified Proofs</p>
            </div>
            <div>
              <p className="font-heritage text-3xl font-bold text-white">5 Metros</p>
              <p className="text-[11px] text-[#8DA9C4] uppercase tracking-wider mt-1">Prime Coverage</p>
            </div>
            <div>
              <p className="font-heritage text-3xl font-bold text-white">&lt; 3 Sec</p>
              <p className="text-[11px] text-[#8DA9C4] uppercase tracking-wider mt-1">Real-time Search</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074] mb-2">
              <Compass className="w-4 h-4 text-[#8DA9C4]" />
              <span>Curated Selection</span>
            </div>
            <h2 className="font-heritage text-3xl sm:text-4xl font-bold text-[#0B2545]">
              Premier Residences & Penthouses
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl">
              Hand-verified titles, architectural blueprints, and high-definition virtual portfolios ready for immediate visit requests.
            </p>
          </div>

          <Link
            href="/properties"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-all shadow-sm"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid of properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* ROLE-SPECIFIC WORKFLOW SHOWCASE */}
      <section className="bg-white py-20 border-y border-[#8DA9C4]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">
              Multi-Role Ecosystem
            </span>
            <h2 className="font-heritage text-3xl sm:text-4xl font-bold text-[#0B2545] mt-2">
              Engineered for Every Real Estate Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-3">
              Each user class has an authenticated profile with customized operational dashboards and controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Sellers & Landlords */}
            <div className="rounded-2xl p-8 bg-[#EEF4F8]/60 border border-[#8DA9C4]/30 hover:border-[#134074] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#134074] text-white flex items-center justify-center mb-6 shadow-md">
                  <Building2 className="w-6 h-6 text-[#8DA9C4]" />
                </div>
                <h3 className="font-heritage text-2xl font-bold text-[#0B2545]">
                  Sellers & Landlords
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Draft, publish, and manage property listings with multi-angle photography, pricing models, and instant status updates (Occupied/Sold).
                </p>
                <ul className="mt-6 space-y-2 text-xs text-[#13315C]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                    <span>Upload photos & specifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                    <span>Link certified estate agents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                    <span>One-click status transitions</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#8DA9C4]/20">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-[#134074] hover:text-[#0B2545] flex items-center gap-1"
                >
                  Access Seller Portal →
                </Link>
              </div>
            </div>

            {/* Card 2: Certified Agents */}
            <div className="rounded-2xl p-8 bg-[#13315C] text-white border border-[#8DA9C4]/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B2545] text-white flex items-center justify-center mb-6 shadow-md border border-[#8DA9C4]/30">
                  <Award className="w-6 h-6 text-[#8DA9C4]" />
                </div>
                <h3 className="font-heritage text-2xl font-bold text-white">
                  Real Estate Agents
                </h3>
                <p className="text-xs text-[#8DA9C4] mt-2 leading-relaxed">
                  Power users representing landlords across multi-property portfolios with verified license numbers and client relationship management.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-gray-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8DA9C4]" />
                    <span>Represent multiple landlord accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8DA9C4]" />
                    <span>Manage multi-city luxury portfolios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8DA9C4]" />
                    <span>RERA & License credential display</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#8DA9C4]/20">
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-[#8DA9C4] hover:text-white flex items-center gap-1"
                >
                  Access Agent Console →
                </Link>
              </div>
            </div>

            {/* Card 3: Buyers & Tenants */}
            <div className="rounded-2xl p-8 bg-[#EEF4F8]/60 border border-[#8DA9C4]/30 hover:border-[#134074] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#134074] text-white flex items-center justify-center mb-6 shadow-md">
                  <Key className="w-6 h-6 text-[#8DA9C4]" />
                </div>
                <h3 className="font-heritage text-2xl font-bold text-[#0B2545]">
                  Buyers & Tenants
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Discover dream properties with sub-second keyword search, interactive map coordinates, and build your personalized private wishlist.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-[#13315C]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                    <span>Interactive map and list toggles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                    <span>Customizable saved favorites list</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                    <span>Transparent verified listing badges</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#8DA9C4]/20">
                <Link
                  href="/favorites"
                  className="text-xs font-semibold text-[#134074] hover:text-[#0B2545] flex items-center gap-1"
                >
                  View Saved Wishlist →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
