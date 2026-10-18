'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Map, 
  LayoutGrid, 
  ArrowUpDown,
  Building,
  Home,
  Sparkles
} from 'lucide-react';

interface SearchFilterBarProps {
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
  totalResults: number;
}

export default function SearchFilterBar({
  viewMode,
  onViewModeChange,
  totalResults,
}: SearchFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'all');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'all');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'all');
  const [minBedrooms, setMinBedrooms] = useState(searchParams.get('minBedrooms') || '0');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();

    const currentFilters = {
      query,
      city,
      listingType,
      propertyType,
      minBedrooms,
      sortBy,
      ...overrides,
    };

    if (currentFilters.query.trim()) params.set('query', currentFilters.query.trim());
    if (currentFilters.city && currentFilters.city !== 'all') params.set('city', currentFilters.city);
    if (currentFilters.listingType && currentFilters.listingType !== 'all') params.set('listingType', currentFilters.listingType);
    if (currentFilters.propertyType && currentFilters.propertyType !== 'all') params.set('propertyType', currentFilters.propertyType);
    if (currentFilters.minBedrooms && currentFilters.minBedrooms !== '0') params.set('minBedrooms', currentFilters.minBedrooms);
    if (currentFilters.sortBy && currentFilters.sortBy !== 'newest') params.set('sortBy', currentFilters.sortBy);

    startTransition(() => {
      router.push(`/properties?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQuery('');
    setCity('all');
    setListingType('all');
    setPropertyType('all');
    setMinBedrooms('0');
    setSortBy('newest');
    startTransition(() => {
      router.push('/properties');
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#8DA9C4]/30 p-4 md:p-6 mb-8 transition-all">
      {/* Top Bar: Search Input, Listing Type Pills, View Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search input with location keyword */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8DA9C4]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Search by city, title, or address (e.g. Worli, Indiranagar, Penthouse)..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-[#8DA9C4]/40 bg-[#EEF4F8]/50 text-sm focus:outline-none focus:border-[#134074] focus:ring-1 focus:ring-[#134074] transition-all text-[#0B2545]"
          />
          <button
            onClick={() => applyFilters()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#134074] text-white text-xs font-semibold rounded-lg hover:bg-[#13315C] transition-colors"
          >
            Search
          </button>
        </div>

        {/* Listing Type Toggle (All, Buy, Rent) */}
        <div className="flex items-center bg-[#EEF4F8] p-1 rounded-xl border border-[#8DA9C4]/30 self-start md:self-auto">
          {(['all', 'sale', 'rent'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setListingType(type);
                applyFilters({ listingType: type });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                listingType === type
                  ? 'bg-[#134074] text-white shadow-sm'
                  : 'text-[#13315C] hover:text-[#0B2545]'
              }`}
            >
              {type === 'all' ? 'All Listings' : type === 'sale' ? 'For Sale' : 'For Rent'}
            </button>
          ))}
        </div>

        {/* Action buttons: Filter drawer & Map/Grid toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filtersOpen
                ? 'bg-[#134074] text-white border-[#134074]'
                : 'bg-white text-[#13315C] border-[#8DA9C4]/40 hover:bg-[#EEF4F8]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Grid vs Map View Toggle (REQ-4.3.4) */}
          <div className="flex items-center bg-[#EEF4F8] p-1 rounded-xl border border-[#8DA9C4]/30">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#134074] text-white shadow-sm'
                  : 'text-[#8DA9C4] hover:text-[#0B2545]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              title="Interactive Map View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-[#134074] text-white shadow-sm'
                  : 'text-[#8DA9C4] hover:text-[#0B2545]'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filters (REQ-4.3.2) */}
      {filtersOpen && (
        <div className="mt-5 pt-5 border-t border-[#8DA9C4]/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
          
          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#13315C] uppercase tracking-wider mb-1.5">
              City / Location
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                applyFilters({ city: e.target.value });
              }}
              className="w-full p-2.5 rounded-xl border border-[#8DA9C4]/40 bg-white text-xs text-[#0B2545] focus:outline-none focus:border-[#134074]"
            >
              <option value="all">All Metros & Regions</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Goa">Goa</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#13315C] uppercase tracking-wider mb-1.5">
              Property Architecture
            </label>
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                applyFilters({ propertyType: e.target.value });
              }}
              className="w-full p-2.5 rounded-xl border border-[#8DA9C4]/40 bg-white text-xs text-[#0B2545] focus:outline-none focus:border-[#134074]"
            >
              <option value="all">All Property Types</option>
              <option value="apartment">Luxury Apartment</option>
              <option value="villa">Private Villa</option>
              <option value="condo">Condominium</option>
              <option value="commercial">Grade-A Commercial</option>
              <option value="house">Independent House</option>
            </select>
          </div>

          {/* Minimum Bedrooms */}
          <div>
            <label className="block text-[11px] font-semibold text-[#13315C] uppercase tracking-wider mb-1.5">
              Bedrooms (Minimum)
            </label>
            <select
              value={minBedrooms}
              onChange={(e) => {
                setMinBedrooms(e.target.value);
                applyFilters({ minBedrooms: e.target.value });
              }}
              className="w-full p-2.5 rounded-xl border border-[#8DA9C4]/40 bg-white text-xs text-[#0B2545] focus:outline-none focus:border-[#134074]"
            >
              <option value="0">Any Bedroom Configuration</option>
              <option value="1">1+ BHK</option>
              <option value="2">2+ BHK</option>
              <option value="3">3+ BHK</option>
              <option value="4">4+ BHK (Penthouse / Villa)</option>
            </select>
          </div>

          {/* Sort By (REQ-4.3.3) */}
          <div>
            <label className="block text-[11px] font-semibold text-[#13315C] uppercase tracking-wider mb-1.5">
              Sort By Criteria
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                applyFilters({ sortBy: e.target.value });
              }}
              className="w-full p-2.5 rounded-xl border border-[#8DA9C4]/40 bg-white text-xs text-[#0B2545] focus:outline-none focus:border-[#134074]"
            >
              <option value="newest">Latest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_asc">Area: Smallest first</option>
              <option value="area_desc">Area: Largest first</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              Showing <strong className="text-[#0B2545]">{totalResults}</strong> curated estates matching criteria
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
