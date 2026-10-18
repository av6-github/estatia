import { getUserFavorites } from '@/app/actions/properties';
import { getCurrentUser } from '@/app/actions/auth';
import PropertyCard from '@/components/PropertyCard';
import Link from 'next/link';
import { Heart, Compass, LogIn, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-10 border border-[#8DA9C4]/30 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#EEF4F8] text-[#134074] flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-[#8DA9C4]" />
          </div>
          <h1 className="font-heritage text-3xl font-bold text-[#0B2545]">
            Saved Residences & Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-3 max-w-md mx-auto leading-relaxed">
            Please log in or select a demo persona from the navigation bar above to save properties and access your curated wishlist.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-colors flex items-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Estatia</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const favorites = await getUserFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#134074] mb-2">
          <Heart className="w-4 h-4 text-rose-500 fill-current" />
          <span>Curated Shortlist</span>
        </div>
        <h1 className="font-heritage text-4xl sm:text-5xl font-bold text-[#0B2545]">
          Your Saved Properties
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Review, compare, and inquire about your shortlisted luxury homes and estates.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#8DA9C4]/30 shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#EEF4F8] text-[#8DA9C4] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-heritage text-2xl font-bold text-[#0B2545]">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Click the heart icon on any property in our collection to bookmark it here for quick access.
          </p>
          <div className="mt-6">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Residences</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
