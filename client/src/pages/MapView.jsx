import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import contributionPin from '../assets/contribution-ping.png.png';
import schoolIcon from '../assets/school-pin.png';
import hospitalIcon from '../assets/hospital-pin.png';
import shopIcon from '../assets/shop-pin.png';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const landmarkTypes = [
  { type: 'school', icon: schoolIcon },
  { type: 'hospital', icon: hospitalIcon },
  { type: 'shop', icon: shopIcon }
];

const staticLandmarks = [
  { id: 1, type: 'school', name: 'Juja High School', lat: -1.1000, lng: 37.0100 },
  { id: 2, type: 'hospital', name: 'Juja Hospital', lat: -1.0950, lng: 37.0120 },
  { id: 3, type: 'shop', name: 'Juja Mall', lat: -1.0980, lng: 37.0150 }
];

const defaultCenter = {
  lat: -1.0959, // Kenya center
  lng: 37.0117,
};

// Custom icons
const listingIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const contributionIcon = new L.Icon({
  iconUrl: contributionPin,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const schoolLeafletIcon = new L.Icon({
  iconUrl: schoolIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const hospitalLeafletIcon = new L.Icon({
  iconUrl: hospitalIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const shopLeafletIcon = new L.Icon({
  iconUrl: shopIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const MapView = () => {
  const [listings, setListings] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/listings`);
        setListings(res.data.listings || []);
      } catch (err) {
        setError('Failed to load listings.');
      }
      setLoading(false);
    };
    const fetchContributions = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/contributions`);
        setContributions(res.data.contributions || []);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchListings();
    fetchContributions();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">Map of Listings & Contributions</h2>
        <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={14} style={{ height: '80vh', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Listings */}
          {listings.map((listing) => {
            const coords = listing.address?.location?.coordinates;
            if (!coords || coords.length !== 2) return null;
            return (
              <Marker
                key={listing._id}
                position={[coords[1], coords[0]]}
                icon={listingIcon}
              >
                <Popup>
                  <div>
                    <strong>{listing.title}</strong><br />
                    {listing.address?.street}<br />
                    <button className="text-blue-600 underline mt-2" onClick={() => window.location.href = `/listing/${listing._id}`}>View Details</button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {/* Contributions */}
          {contributions.map((contrib) => {
            const coords = contrib.location?.coordinates;
            if (!coords || coords.length !== 2) return null;
            return (
              <Marker
                key={contrib._id}
                position={[coords[1], coords[0]]}
                icon={contributionIcon}
              >
                <Popup>
                  <div>
                    <strong>Contribution</strong><br />
                    Type: {contrib.type}<br />
                    Status: {contrib.status}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {/* Landmarks */}
          {staticLandmarks.map((lm) => {
            let icon = listingIcon;
            if (lm.type === 'school') icon = schoolLeafletIcon;
            if (lm.type === 'hospital') icon = hospitalLeafletIcon;
            if (lm.type === 'shop') icon = shopLeafletIcon;
            return (
              <Marker
                key={lm.id}
                position={[lm.lat, lm.lng]}
                icon={icon}
              >
                <Popup>
                  <div>
                    <strong>{lm.name}</strong><br />
                    Type: {lm.type}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView; 