import Link from 'next/link';
import { Building2, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B2545] text-white border-t border-[#8DA9C4]/20 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#134074] border border-[#8DA9C4]/40 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#8DA9C4]" />
              </div>
              <span className="font-heritage text-2xl tracking-wider font-semibold text-white">
                ESTATIA
              </span>
            </div>
            <p className="text-xs text-[#8DA9C4] leading-relaxed">
              A Real Estate Management System (REMS) engineered for seamless property acquisitions, luxury residential leasing, and verified transactions.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#8DA9C4]/80">
              <ShieldCheck className="w-4 h-4 text-[#8DA9C4]" />
              <span>IEEE 830 Specification Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heritage text-base tracking-wider font-semibold text-white uppercase text-xs">
              Explore Portfolio
            </h4>
            <ul className="space-y-2 text-xs text-[#8DA9C4]">
              <li>
                <Link href="/properties?listingType=sale" className="hover:text-white transition-colors">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?listingType=rent" className="hover:text-white transition-colors">
                  Exclusive Luxury Rentals
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=villa" className="hover:text-white transition-colors">
                  Private Villas & Penthouses
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=commercial" className="hover:text-white transition-colors">
                  Grade-A Commercial Suites
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div className="space-y-3">
            <h4 className="font-heritage text-base tracking-wider font-semibold text-white uppercase text-xs">
              Role Workflows
            </h4>
            <ul className="space-y-2 text-xs text-[#8DA9C4]">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Seller & Landlord Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Certified Real Estate Agents
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white transition-colors">
                  Buyer & Tenant Saved Shortlists
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Admin Verification Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* System & Academic Project Info */}
          <div className="space-y-3">
            <h4 className="font-heritage text-base tracking-wider font-semibold text-white uppercase text-xs">
              Project Specification
            </h4>
            <div className="space-y-2 text-xs text-[#8DA9C4]">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8DA9C4]" />
                <span>Mumbai • Bengaluru • Delhi • Goa</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8DA9C4]" />
                <span>contact@estatia.project</span>
              </p>
              <div className="pt-2 text-[11px] text-[#8DA9C4]/70 border-t border-[#8DA9C4]/20">
                Developed by Atharv Vedant
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#8DA9C4]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8DA9C4]/70">
          <p>© 2026 ESTATIA REMS. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Powered by Next.js 16 • Supabase PostgreSQL • Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
