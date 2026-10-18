import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types/database';
import FavoriteButton from './FavoriteButton';
import { Bed, Bath, Maximize2, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function formatPrice(price: number, listingType: string): string {
  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, '')} Cr${listingType === 'rent' ? '/mo' : ''}`;
  } else if (price >= 100000) {
    const lakh = (price / 100000).toFixed(2);
    return `₹${lakh.replace(/\.00$/, '')} L${listingType === 'rent' ? '/mo' : ''}`;
  } else {
    return `₹${price.toLocaleString('en-IN')}${listingType === 'rent' ? '/mo' : ''}`;
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage =
    property.images?.find((img) => img.is_primary)?.image_url ||
    property.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80';

  const isSoldOrOccupied = property.status === 'sold' || property.status === 'occupied';

  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-[#8DA9C4]/30 hover:border-[#134074] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0B2545]/10">
        <Image
          src={primaryImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm ${
              property.listing_type === 'sale'
                ? 'bg-[#134074] text-white'
                : 'bg-[#13315C] text-[#8DA9C4] border border-[#8DA9C4]/40'
            }`}
          >
            {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/50 backdrop-blur-md text-white border border-white/20 capitalize">
            {property.property_type}
          </span>

          {property.verification_status === 'verified' && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Status overlay if sold/occupied */}
        {isSoldOrOccupied && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-semibold text-xs tracking-wider uppercase shadow-lg">
              {property.status === 'sold' ? 'Sold Out' : 'Occupied'}
            </span>
          </div>
        )}

        {/* Favorite button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton
            propertyId={property.id}
            initialFavorited={property.is_favorited}
          />
        </div>

        {/* Price Tag over bottom left of photo */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-xl font-bold font-heritage tracking-wide">
            {formatPrice(property.price, property.listing_type)}
          </p>
          {property.security_deposit > 0 && (
            <p className="text-[10px] text-gray-200">
              Deposit: ₹{property.security_deposit.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>

      {/* Details container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#134074] font-medium mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8DA9C4]" />
            <span className="truncate">{property.city}, {property.state}</span>
          </div>

          <Link href={`/properties/${property.id}`}>
            <h3 className="font-heritage text-lg font-semibold text-[#0B2545] hover:text-[#134074] transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Specs bar */}
        <div className="mt-4 pt-4 border-t border-[#8DA9C4]/20 flex items-center justify-between text-xs text-[#13315C]">
          <div className="flex items-center gap-1" title={`${property.bedrooms} Bedrooms`}>
            <Bed className="w-4 h-4 text-[#8DA9C4]" />
            <span>{property.bedrooms > 0 ? `${property.bedrooms} Beds` : 'Studio'}</span>
          </div>

          <div className="flex items-center gap-1" title={`${property.bathrooms} Bathrooms`}>
            <Bath className="w-4 h-4 text-[#8DA9C4]" />
            <span>{property.bathrooms} Baths</span>
          </div>

          <div className="flex items-center gap-1" title={`${property.area_sqft} Sq. Ft.`}>
            <Maximize2 className="w-4 h-4 text-[#8DA9C4]" />
            <span>{property.area_sqft.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Action Link */}
        <div className="mt-4">
          <Link
            href={`/properties/${property.id}`}
            className="w-full block text-center py-2 rounded-xl text-xs font-semibold bg-[#EEF4F8] text-[#134074] hover:bg-[#134074] hover:text-white transition-all duration-200"
          >
            View Estate Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
