'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/actions/properties';

interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited?: boolean;
  className?: string;
}

export default function FavoriteButton({
  propertyId,
  initialFavorited = false,
  className = '',
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    // Optimistic toggle
    const nextState = !favorited;
    setFavorited(nextState);

    const res = await toggleFavorite(propertyId);
    if (res.error) {
      alert(res.error);
      setFavorited(!nextState); // rollback
    } else if (res.favorited !== undefined) {
      setFavorited(res.favorited);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`p-2.5 rounded-full transition-all duration-300 backdrop-blur-md ${
        favorited
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
          : 'bg-white/85 text-[#0B2545] hover:bg-white hover:text-rose-500 shadow-md'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${
          favorited ? 'fill-current scale-110' : ''
        }`}
      />
    </button>
  );
}
