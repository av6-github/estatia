'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PropertyImage } from '@/types/database';

interface PropertyDetailsGalleryProps {
  images?: PropertyImage[];
  title: string;
}

export default function PropertyDetailsGallery({
  images = [],
  title,
}: PropertyDetailsGalleryProps) {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=80',
  ];

  const imageList =
    images.length > 0
      ? images.map((i) => i.image_url)
      : fallbackImages;

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Featured Primary Image */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-lg border border-[#8DA9C4]/30 bg-[#0B2545]/10">
        <Image
          src={imageList[activeIndex]}
          alt={`${title} - view ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 80vw"
          className="object-cover transition-all duration-300"
        />
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
          {activeIndex + 1} / {imageList.length} Photos
        </div>
      </div>

      {/* Thumbnails Row */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {imageList.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                activeIndex === idx
                  ? 'border-[#134074] scale-95 shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
