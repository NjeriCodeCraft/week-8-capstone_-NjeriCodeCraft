import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const amenityIcons = {
  water: '💧',
  electricity: '⚡',
  wifi: '📶',
  security: '🔒',
  parking: '🚗',
  kitchen: '🍳',
  balcony: '🌅',
  furnished: '🛋️',
};

const ListingCard = ({ listing }) => {
  const mainImage = listing.images?.find(img => img.isPrimary) || listing.images?.[0];
  const navigate = useNavigate();
  const { user, isAuthenticated, reloadUser } = useAuth();
  const [saving, setSaving] = React.useState(false);
  const isFavorited = isAuthenticated && user?.favorites?.some(id => id === listing._id || id?._id === listing._id);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`/api/users/favorites/${listing._id}`);
      reloadUser();
      toast.success(isFavorited ? 'Removed from favorites.' : 'Added to favorites!');
    } catch {
      toast.error('Failed to update favorites.');
    }
    setSaving(false);
  };

  return (
    <div className="bg-card rounded-lg shadow p-4 hover:bg-background transition">
      <h2 className="text-xl font-bold text-heading mb-2">{listing.title}</h2>
      <p className="text-text-subtle mb-2">{listing.location}</p>
      <p className="text-accent-500 font-bold mb-2">Ksh {listing.price}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.entries(listing.amenities || {})
          .filter(([key, value]) => value && amenityIcons[key])
          .map(([key]) => (
            <span key={key} title={key} className="text-xl text-blue" aria-label={key}>
              {amenityIcons[key]}
            </span>
          ))}
      </div>
      <div className="text-xs text-gray-500 mb-2 capitalize">{listing.propertyType}</div>
      <button className="bg-accent-500 text-white px-4 py-2 rounded hover:bg-hover-blue transition mt-2">View Details</button>
    </div>
  );
};

export default ListingCard; 