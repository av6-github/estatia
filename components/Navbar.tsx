'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout, demoLogin } from '@/app/actions/auth';
import { Profile, UserRole } from '@/types/database';
import { 
  Building2, 
  Heart, 
  User, 
  LogOut, 
  PlusCircle, 
  ShieldCheck, 
  Menu, 
  X,
  Compass,
  Briefcase,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { profile } = await getCurrentUser();
        setProfile(profile);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [pathname]);

  const handleDemoSwitch = async (role: UserRole) => {
    setDemoDropdownOpen(false);
    await demoLogin(role);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B2545]/90 backdrop-blur-md border-b border-[#8DA9C4]/20 text-white transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with "The Heritage Legacy" Vintage Serif Font */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#134074] border border-[#8DA9C4]/40 flex items-center justify-center shadow-inner group-hover:border-white transition-colors">
              <Building2 className="w-5 h-5 text-[#8DA9C4] group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-heritage text-2xl tracking-wider font-semibold text-white group-hover:text-[#8DA9C4] transition-colors leading-none">
                ESTATIA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8DA9C4] font-medium mt-1">
                Premier Estates
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link 
              href="/properties" 
              className={`flex items-center gap-1.5 transition-colors ${pathname === '/properties' ? 'text-white font-semibold border-b-2 border-[#8DA9C4] pb-1' : 'text-[#8DA9C4] hover:text-white'}`}
            >
              <Compass className="w-4 h-4" />
              Explore Residences
            </Link>

            <Link 
              href="/properties?listingType=sale" 
              className={`transition-colors ${pathname.includes('listingType=sale') ? 'text-white font-semibold' : 'text-[#8DA9C4] hover:text-white'}`}
            >
              Buy
            </Link>

            <Link 
              href="/properties?listingType=rent" 
              className={`transition-colors ${pathname.includes('listingType=rent') ? 'text-white font-semibold' : 'text-[#8DA9C4] hover:text-white'}`}
            >
              Rent
            </Link>

            <Link 
              href="/favorites" 
              className={`flex items-center gap-1.5 transition-colors ${pathname === '/favorites' ? 'text-white font-semibold border-b-2 border-[#8DA9C4] pb-1' : 'text-[#8DA9C4] hover:text-white'}`}
            >
              <Heart className="w-4 h-4 text-[#8DA9C4]" />
              Favorites
            </Link>
          </nav>

          {/* Right Action Controls: Quick Demo Switcher & Account */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Quick Demo Role Switcher (Academic Evaluation Feature) */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#13315C] text-[#8DA9C4] hover:text-white hover:bg-[#134074] border border-[#8DA9C4]/30 transition-all shadow-sm"
                title="Switch test personas instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Switch Persona</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B2545] border border-[#8DA9C4]/30 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#8DA9C4] tracking-wider border-b border-[#8DA9C4]/20">
                    Switch Active Persona (1-Click)
                  </div>
                  <button 
                    onClick={() => handleDemoSwitch('seller')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-[#134074] flex items-center justify-between transition-colors"
                  >
                    <span>Vikramaditya (Seller)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Seller</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('agent')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-[#134074] flex items-center justify-between transition-colors"
                  >
                    <span>Ananya Deshmukh (Agent)</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Agent</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('buyer')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-[#134074] flex items-center justify-between transition-colors"
                  >
                    <span>Rohan Mehta (Buyer)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Buyer</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('tenant')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-[#134074] flex items-center justify-between transition-colors"
                  >
                    <span>Pooja Kashyap (Tenant)</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Tenant</span>
                  </button>
                  <button 
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-white hover:bg-[#134074] flex items-center justify-between transition-colors border-t border-[#8DA9C4]/20"
                  >
                    <span>Platform Admin</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* If seller or agent, show "Add Property" button */}
            {profile && ['seller', 'agent', 'admin'].includes(profile.role) && (
              <Link
                href="/properties/new"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#8DA9C4] text-[#0B2545] hover:bg-white transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                List Property
              </Link>
            )}

            {/* Profile or Login */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-[#13315C] animate-pulse" />
            ) : profile ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13315C] hover:bg-[#134074] border border-[#8DA9C4]/30 text-xs font-medium text-white transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#8DA9C4]" />
                  <span className="capitalize">{profile.full_name.split(' ')[0]}</span>
                  <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-[#134074] text-[#8DA9C4]">
                    {profile.role}
                  </span>
                </Link>

                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-1.5 text-[#8DA9C4] hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 rounded-full text-xs font-medium text-[#8DA9C4] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] border border-[#8DA9C4]/40 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#8DA9C4] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B2545] border-b border-[#8DA9C4]/20 px-4 py-4 space-y-3 text-sm">
          <Link 
            href="/properties" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#8DA9C4] hover:text-white py-1"
          >
            Explore Residences
          </Link>
          <Link 
            href="/properties?listingType=sale" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#8DA9C4] hover:text-white py-1"
          >
            Buy Properties
          </Link>
          <Link 
            href="/properties?listingType=rent" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#8DA9C4] hover:text-white py-1"
          >
            Rent Properties
          </Link>
          <Link 
            href="/favorites" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#8DA9C4] hover:text-white py-1"
          >
            Favorites
          </Link>
          <div className="pt-2 border-t border-[#8DA9C4]/20">
            {profile ? (
              <div className="space-y-2">
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white font-medium"
                >
                  Dashboard ({profile.full_name} - {profile.role})
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-rose-300 text-xs flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-xs rounded-full bg-[#13315C] text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-xs rounded-full bg-[#134074] text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
