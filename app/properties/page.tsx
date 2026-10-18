import { getProperties, PropertyFilterOptions } from '@/app/actions/properties';
import PropertiesClientView from '@/components/PropertiesClientView';
import { Compass } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PropertiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedParams = await searchParams;

  const filters: PropertyFilterOptions = {
    query: typeof resolvedParams.query === 'string' ? resolvedParams.query : undefined,
    city: typeof resolvedParams.city === 'string' ? resolvedParams.city : undefined,
    listingType: (typeof resolvedParams.listingType === 'string' ? resolvedParams.listingType : 'all') as PropertyFilterOptions['listingType'],
    propertyType: (typeof resolvedParams.propertyType === 'string' ? resolvedParams.propertyType : 'all') as PropertyFilterOptions['propertyType'],
    minBedrooms: typeof resolvedParams.minBedrooms === 'string' ? parseInt(resolvedParams.minBedrooms, 10) : undefined,
    sortBy: (typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'newest') as PropertyFilterOptions['sortBy'],
    status: 'published',
  };

  const properties = await getProperties(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#134074] mb-2">
          <Compass className="w-4 h-4 text-[#8DA9C4]" />
          <span>Curated Real Estate Portfolio</span>
        </div>
        <h1 className="font-heritage text-4xl sm:text-5xl font-bold text-[#0B2545]">
          Explore Available Residences
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Filter through prime residential properties, coastal villas, luxury penthouses, and commercial suites.
        </p>
      </div>

      {/* Main Filter & Results View */}
      <PropertiesClientView properties={properties} />
    </div>
  );
}
