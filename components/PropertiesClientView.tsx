'use client';

import { useState } from 'react';
import { Property } from '@/types/database';
import SearchFilterBar from './SearchFilterBar';
import PropertyCard from './PropertyCard';
import MapViewer from './MapViewer';
import { Building2 } from 'lucide-react';

interface PropertiesClientViewProps {
  properties: Property[];
}

export default function PropertiesClientView({ properties }: PropertiesClientViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  return (
    <div>
      <SearchFilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={properties.length}
      />

      {properties.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[#8DA9C4]/30 shadow-sm max-w-xl mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-[#EEF4F8] text-[#134074] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#8DA9C4]" />
          </div>
          <h3 className="font-heritage text-2xl font-bold text-[#0B2545]">
            No Matching Estates Found
          </h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing specific filters, or selecting a different city.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <MapViewer properties={properties} />
        </div>
      )}
    </div>
  );
}
