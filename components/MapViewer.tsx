'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/types/database';
import { formatPrice } from './PropertyCard';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';

interface MapViewerProps {
  properties: Property[];
}

export default function MapViewer({ properties }: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    properties[0] || null
  );

  useEffect(() => {
    let mapInstance: LeafletMap | null = null;

    async function initLeaflet() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;
      // Inject leaflet stylesheet if not present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Default center: India center approx
      const defaultLat = selectedProperty?.latitude || 19.0760;
      const defaultLng = selectedProperty?.longitude || 72.8777;

      mapInstance = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      const markersGroup = L.featureGroup();

      properties.forEach((p) => {
        if (!p.latitude || !p.longitude) return;

        const customIcon = L.divIcon({
          className: 'custom-estatia-marker',
          html: `<div style="
            background: #134074;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 9999px;
            border: 2px solid #8DA9C4;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">₹ ${formatPrice(p.price, p.listing_type)}</div>`,
          iconSize: [80, 26],
          iconAnchor: [40, 13],
        });

        const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });
        marker.on('click', () => {
          setSelectedProperty(p);
        });
        marker.addTo(markersGroup);
      });

      markersGroup.addTo(mapInstance);

      if (properties.length > 0 && markersGroup.getBounds().isValid()) {
        mapInstance.fitBounds(markersGroup.getBounds(), { padding: [50, 50], maxZoom: 12 });
      }
    }

    initLeaflet();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [properties]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-[#8DA9C4]/30 shadow-md">
      {/* Map canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Card for Selected Property */}
      {selectedProperty && (
        <div className="absolute bottom-6 left-6 z-10 w-80 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#8DA9C4]/40 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3">
            <Image
              src={
                selectedProperty.images?.[0]?.image_url ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
              }
              alt={selectedProperty.title}
              fill
              className="object-cover"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[#134074] text-white">
              {selectedProperty.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          </div>

          <p className="font-heritage text-lg font-bold text-[#0B2545] truncate">
            {selectedProperty.title}
          </p>
          <p className="text-xs text-[#134074] font-medium flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#8DA9C4]" />
            {selectedProperty.address}, {selectedProperty.city}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-heritage text-base font-bold text-[#134074]">
              {formatPrice(selectedProperty.price, selectedProperty.listing_type)}
            </p>
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#134074] text-white hover:bg-[#13315C] flex items-center gap-1 transition-colors"
            >
              <span>Explore</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
