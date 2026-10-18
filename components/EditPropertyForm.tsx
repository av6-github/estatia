'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProperty, updatePropertyStatus } from '@/app/actions/properties';
import { Property } from '@/types/database';
import { 
  Building2, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  Trash2, 
  Eye, 
  FileEdit,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface EditPropertyFormProps {
  property: Property;
}

export default function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(property.status);

  const [amenitiesList, setAmenitiesList] = useState<string[]>(property.amenities || []);
  const [amenityInput, setAmenityInput] = useState('');

  const [imageUrls, setImageUrls] = useState<string[]>(
    property.images?.map((i) => i.image_url) || []
  );
  const [imageUrlInput, setImageUrlInput] = useState('');

  const addAmenity = () => {
    if (amenityInput.trim() && !amenitiesList.includes(amenityInput.trim())) {
      setAmenitiesList([...amenitiesList, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (item: string) => {
    setAmenitiesList(amenitiesList.filter((a) => a !== item));
  };

  const addImage = () => {
    if (imageUrlInput.trim() && !imageUrls.includes(imageUrlInput.trim())) {
      setImageUrls([...imageUrls, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const removeImage = (url: string) => {
    setImageUrls(imageUrls.filter((u) => u !== url));
  };

  const handleMakeDraft = async () => {
    setLoading(true);
    const res = await updatePropertyStatus(property.id, 'draft');
    if (res.error) {
      setError(res.error);
    } else {
      setStatus('draft');
    }
    setLoading(false);
  };

  const processForm = async (form: HTMLFormElement, publish: boolean) => {
    setError(null);
    setLoading(true);

    const formData = new FormData(form);
    formData.set('amenities', amenitiesList.join(', '));
    formData.set('image_urls', imageUrls.join('\n'));
    formData.set('publish', publish ? 'true' : 'false');

    const res = await updateProperty(property.id, formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(`/properties/${property.id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    processForm(e.currentTarget, status === 'published');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/properties/${property.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134074] hover:text-[#0B2545] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listing Details</span>
        </Link>

        <span
          className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
            status === 'published'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'draft'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          Current Status: {status}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#8DA9C4]/30 shadow-lg space-y-8">
        {/* Banner if published */}
        {status === 'published' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">This listing is currently Published and visible to the public.</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  You can convert this listing to a Draft first to perform your edits safely without displaying incomplete changes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleMakeDraft}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] shrink-0 transition-colors shadow-sm"
            >
              Convert to Draft to Edit
            </button>
          </div>
        )}

        {status === 'draft' && (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>This listing is in <strong>Draft mode</strong>. You can modify any details and choose to save as Draft or Re-publish.</span>
          </div>
        )}

        {/* Title */}
        <div className="border-b border-[#8DA9C4]/20 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4F8] text-[#134074] text-xs font-bold uppercase tracking-wider mb-2">
            <FileEdit className="w-3.5 h-3.5" />
            <span>Listing Editor</span>
          </div>
          <h1 className="font-heritage text-3xl sm:text-4xl font-bold text-[#0B2545]">
            Edit Estate Listing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Update pricing, architectural specs, photos, or description for &quot;{property.title}&quot;.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Title & Classification */}
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
                  defaultValue={property.title}
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
                  defaultValue={property.listing_type}
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
                  defaultValue={property.property_type}
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
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  defaultValue={property.description}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>
            </div>
          </div>

          {/* 2. Financials & Dimensions */}
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
                  defaultValue={property.price}
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
                  defaultValue={property.security_deposit || 0}
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
                  defaultValue={property.area_sqft}
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
                  defaultValue={property.bedrooms}
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
                  defaultValue={property.bathrooms}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>
            </div>
          </div>

          {/* 3. Location */}
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
                  defaultValue={property.address}
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
                  defaultValue={property.city}
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
                  defaultValue={property.state}
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
                  defaultValue={property.zip_code}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#8DA9C4]/40 text-xs focus:outline-none focus:border-[#134074]"
                />
              </div>
            </div>
          </div>

          {/* 4. Amenities */}
          <div className="pt-6 border-t border-[#8DA9C4]/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#134074] mb-2">
              4. Curated Amenities
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="Type an amenity..."
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

          {/* 5. Photographs */}
          <div className="pt-6 border-t border-[#8DA9C4]/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#134074]">
                5. High-Resolution Photographs
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
                placeholder="Paste high-res image URL..."
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

          {/* Action buttons */}
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
              Save Changes as Draft
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                const form = e.currentTarget.closest('form');
                if (form) processForm(form, true);
              }}
              className="px-8 py-3 rounded-full text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] shadow-lg shadow-[#134074]/30 transition-all text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Saving...' : 'Save & Publish to Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
