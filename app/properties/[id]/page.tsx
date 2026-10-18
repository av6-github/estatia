import { getPropertyById, updatePropertyStatus } from '@/app/actions/properties';
import { getCurrentUser } from '@/app/actions/auth';
import PropertyDetailsGallery from '@/components/PropertyDetailsGallery';
import FavoriteButton from '@/components/FavoriteButton';
import { formatPrice } from '@/components/PropertyCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  Building2, 
  Award, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  AlertCircle
} from 'lucide-react';
import PropertyStatusManager from '@/components/PropertyStatusManager';
import ScheduleVisitButton from '@/components/ScheduleVisitButton';

export const dynamic = 'force-dynamic';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  const { user, profile } = await getCurrentUser();

  if (!property) {
    notFound();
  }

  const isOwnerOrAgent =
    user && (user.id === property.owner_id || user.id === property.agent_id || profile?.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#134074] hover:text-[#0B2545] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Residences</span>
        </Link>

        <div className="flex items-center gap-3">
          <FavoriteButton
            propertyId={property.id}
            initialFavorited={property.is_favorited}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Gallery & Property Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery */}
          <PropertyDetailsGallery images={property.images} title={property.title} />

          {/* Title, Address & Badges */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  property.listing_type === 'sale'
                    ? 'bg-[#134074] text-white'
                    : 'bg-[#13315C] text-[#8DA9C4]'
                }`}
              >
                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EEF4F8] text-[#0B2545] border border-[#8DA9C4]/30 capitalize">
                {property.property_type}
              </span>

              {property.verification_status === 'verified' ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Title & Ownership
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Pending Document Verification
                </span>
              )}

              {property.status !== 'published' && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                  {property.status}
                </span>
              )}
            </div>

            <h1 className="font-heritage text-3xl sm:text-4xl font-bold text-[#0B2545]">
              {property.title}
            </h1>

            <p className="text-sm text-[#134074] font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#8DA9C4]" />
              <span>{property.address}, {property.city}, {property.state} - {property.zip_code}</span>
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#8DA9C4]/20 text-center">
              <div className="p-3 rounded-2xl bg-[#EEF4F8]/60">
                <Bed className="w-5 h-5 mx-auto text-[#134074] mb-1" />
                <p className="font-heritage text-lg font-bold text-[#0B2545]">
                  {property.bedrooms > 0 ? property.bedrooms : 'Studio'}
                </p>
                <p className="text-[11px] text-gray-500 uppercase">Bedrooms</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#EEF4F8]/60">
                <Bath className="w-5 h-5 mx-auto text-[#134074] mb-1" />
                <p className="font-heritage text-lg font-bold text-[#0B2545]">
                  {property.bathrooms}
                </p>
                <p className="text-[11px] text-gray-500 uppercase">Bathrooms</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#EEF4F8]/60">
                <Maximize2 className="w-5 h-5 mx-auto text-[#134074] mb-1" />
                <p className="font-heritage text-lg font-bold text-[#0B2545]">
                  {property.area_sqft.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-500 uppercase">Sq. Feet</p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm space-y-4">
            <h2 className="font-heritage text-2xl font-bold text-[#0B2545]">
              Architectural Overview & Description
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities & Features */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-sm space-y-4">
              <h2 className="font-heritage text-2xl font-bold text-[#0B2545]">
                Curated Amenities & Estate Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {property.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EEF4F8]/60 border border-[#8DA9C4]/20 text-xs font-medium text-[#13315C]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner/Agent Management Toolbar if authorized */}
          {isOwnerOrAgent && (
            <PropertyStatusManager property={property} />
          )}

        </div>

        {/* Right Column: Pricing & Contact Card (1 col) */}
        <div className="space-y-6">
          
          {/* Price & Primary CTA Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#8DA9C4]/30 shadow-md space-y-6 sticky top-28">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                {property.listing_type === 'sale' ? 'Offered Purchase Price' : 'Monthly Lease Amount'}
              </p>
              <p className="font-heritage text-3xl sm:text-4xl font-bold text-[#134074] mt-1">
                {formatPrice(property.price, property.listing_type)}
              </p>
              {property.security_deposit > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Security Deposit: ₹{property.security_deposit.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 pt-2">
              <a
                href={`mailto:${property.agent?.email || property.owner?.email || 'contact@estatia.project'}?subject=Inquiry: ${encodeURIComponent(property.title)}`}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] transition-all text-center block shadow-md"
              >
                Send Formal Acquisition Inquiry
              </a>

              <ScheduleVisitButton
                propertyId={property.id}
                hostId={property.agent_id || property.owner_id}
                propertyTitle={property.title}
              />
            </div>

            {/* Verification Assurance */}
            <div className="pt-4 border-t border-[#8DA9C4]/20 space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#134074] shrink-0 mt-0.5" />
                <span>Title documents logged under REQ-4.4 for transparency.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#134074] shrink-0 mt-0.5" />
                <span>Zero unsolicited spam; in-app routed communications.</span>
              </div>
            </div>

            {/* Owner or Agent Profile Card */}
            {(property.agent || property.owner) && (
              <div className="pt-6 border-t border-[#8DA9C4]/20">
                <p className="text-[11px] uppercase tracking-wider font-bold text-[#134074] mb-3">
                  {property.agent ? 'Authorized Listing Agent' : 'Property Owner'}
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#134074] text-white flex items-center justify-center font-bold text-base overflow-hidden">
                    {property.agent?.avatar_url || property.owner?.avatar_url ? (
                      <img
                        src={property.agent?.avatar_url || property.owner?.avatar_url || ''}
                        alt="Representative"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (property.agent?.full_name || property.owner?.full_name || 'E')[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0B2545] truncate">
                      {property.agent?.full_name || property.owner?.full_name}
                    </p>
                    {property.agent?.agency_name && (
                      <p className="text-xs text-gray-500 truncate">
                        {property.agent.agency_name}
                      </p>
                    )}
                    {property.agent?.license_number && (
                      <p className="text-[10px] text-[#134074] font-medium truncate">
                        RERA: {property.agent.license_number}
                      </p>
                    )}
                  </div>
                </div>

                {(property.agent?.bio || property.owner?.bio) && (
                  <p className="text-xs text-gray-500 mt-3 italic line-clamp-3">
                    &quot;{property.agent?.bio || property.owner?.bio}&quot;
                  </p>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
