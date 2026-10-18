'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/app/actions/properties';
import { 
  Building2, 
  PlusCircle, 
  Sparkles, 
  AlertCircle, 
  Upload, 
  MapPin, 
  DollarSign, 
  Home, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amenitiesList, setAmenitiesList] = useState<string[]>([
    'Swimming Pool', '24/7 Security', 'Private Parking', 'High Speed Fibre', 'Clubhouse'
  ]);
  const [amenityInput, setAmenityInput] = useState('');

  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&auto=format&fit=crop&q=80'
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const addAmenity = () => {
    if (amenityInput.trim() && !amenitiesList.includes(amenityInput.trim())) {
      setAmenitiesList([...amenitiesList, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (item: string) => {
    setAmenitiesList(amenitiesList.filter(a => a !== item));
  };

  const addImage = () => {
    if (imageUrlInput.trim() && !imageUrls.includes(imageUrlInput.trim())) {
      setImageUrls([...imageUrls, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const removeImage = (url: string) => {
    setImageUrls(imageUrls.filter(u => u !== url));
  };

  const processForm = async (form: HTMLFormElement, publish: boolean) => {
    setError(null);
    setLoading(true);

    const formData = new FormData(form);
    formData.set('amenities', amenitiesList.join(', '));
    formData.set('image_urls', imageUrls.join('\n'));
    formData.set('publish', publish ? 'true' : 'false');

    const res = await createProperty(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.propertyId) {
      router.push(`/properties/${res.propertyId}`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    processForm(e.currentTarget, true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134074] hover:text-[#0B2545] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#8DA9C4]/30 shadow-lg">
        
        {/* Title */}
        <div className="mb-8 border-b border-[#8DA9C4]/20 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4F8] text-[#134074] text-xs font-bold uppercase tracking-wider mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>REQ-4.2 Listing Creator</span>
          </div>
          <h1 className="font-heritage text-3xl sm:text-4xl font-bold text-[#0B2545]">
            Publish a New Estate Listing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Fill in the architectural specifications, location, pricing model, and upload high-resolution photographs.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#134074] mb-4">
              1. Title & Architectural Classification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Estate Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. The Imperial Duplex Penthouse"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Listing Type *
                </label>
                <select
                  name="listing_type"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074] bg-white"
                >
                  <option value="sale">For Sale (Outright Purchase)</option>
                  <option value="rent">For Rent / Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Property Category *
                </label>
                <select
                  name="property_type"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074] bg-white"
                >
                  <option value="apartment">Luxury Apartment</option>
                  <option value="villa">Private Villa</option>
                  <option value="condo">Condominium</option>
                  <option value="commercial">Commercial Suite</option>
                  <option value="house">Independent House</option>
                  <option value="plot">Land / Plot</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Detailed Architectural Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Detail the layout, views, finishes, materials, orientation, and unique characteristics..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Dimensions */}
          <div className="pt-6 border-t border-[#8DA9C4]/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#134074] mb-4">
              2. Financials & Dimensional Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Price / Monthly Rent (INR ₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  placeholder="e.g. 25000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Security Deposit (INR ₹)
                </label>
                <input
                  type="number"
                  name="security_deposit"
                  min="0"
                  defaultValue="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Carpet / Super Area (Sq. Ft.) *
                </label>
                <input
                  type="number"
                  name="area_sqft"
                  required
                  min="1"
                  placeholder="e.g. 3200"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  required
                  min="0"
                  defaultValue="3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  required
                  min="0"
                  defaultValue="3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="pt-6 border-t border-[#8DA9C4]/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#134074] mb-4">
              3. Location & Geography
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Street Address & Landmark *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g. Worli Sea Face, Near Nehru Planetarium"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  City / Metro *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Mumbai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  defaultValue="Maharashtra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2545] mb-1">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  name="zip_code"
                  defaultValue="400018"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>
            </div>
          </div>

          {/* Amenities Tagging */}
          <div className="pt-6 border-t border-[#8DA9C4]/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#134074] mb-2">
              4. Curated Amenities
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                placeholder="Type an amenity (e.g. Sea View, EV Charging)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 rounded-xl bg-[#134074] text-white text-xs font-semibold hover:bg-[#13315C]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((a, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-[#EEF4F8] text-[#134074] text-xs font-medium border border-[#8DA9C4]/30 flex items-center gap-1.5"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => removeAmenity(a)}
                    className="text-gray-400 hover:text-rose-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Photo Portfolio (REQ-4.2.2) */}
          <div className="pt-6 border-t border-[#8DA9C4]/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#134074]">
                5. High-Resolution Photographs (REQ-4.2.2)
              </h3>
              <span className="text-[11px] text-gray-500">
                Minimum 1 photograph required for publishing
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste high-res image URL (e.g. Unsplash or Supabase Storage)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 rounded-xl bg-[#134074] text-white text-xs font-semibold hover:bg-[#13315C]"
              >
                Add Photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-[#8DA9C4]/40 group">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 text-[10px]"
                  >
                    ✕
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#134074] text-white text-[9px] uppercase font-bold">
                      Cover Photo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-8 border-t border-[#8DA9C4]/20 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                const form = e.currentTarget.closest('form');
                if (form) processForm(form, false);
              }}
              className="px-6 py-3 rounded-full text-xs font-semibold bg-[#EEF4F8] text-[#134074] hover:bg-[#8DA9C4]/20 border border-[#8DA9C4]/30 transition-all text-center"
            >
              Save as Draft Listing
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] shadow-lg shadow-[#134074]/30 transition-all text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Publishing...' : 'Publish to Public Feed'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
