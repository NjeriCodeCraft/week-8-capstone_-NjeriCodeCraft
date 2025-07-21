import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Contribute = () => {
  const [type, setType] = useState('photo');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleGeo = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => setError('Failed to get location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('media', media);
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('address', address);
      formData.append('area', area);
      formData.append('description', description);
      await axios.post(`${API_BASE_URL}/api/contributions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Contribution submitted! Thank you for helping the community.');
      setMedia(null);
      setMediaPreview(null);
      setLat('');
      setLng('');
      setAddress('');
      setArea('');
      setDescription('');
    } catch (err) {
      setError('Failed to submit contribution');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">Contribute to the Community</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1">
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="report">Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Media (photo/video)</label>
            <input type="file" accept={type === 'photo' ? 'image/*' : 'video/*'} onChange={handleMediaChange} />
            {mediaPreview && (
              type === 'photo' ? (
                <img src={mediaPreview} alt="preview" className="h-32 w-full object-cover rounded mt-2" />
              ) : (
                <video src={mediaPreview} controls className="h-32 w-full object-cover rounded mt-2" />
              )
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input type="number" value={lat} onChange={e => setLat(e.target.value)} className="border rounded px-2 py-1 w-full" step="any" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input type="number" value={lng} onChange={e => setLng(e.target.value)} className="border rounded px-2 py-1 w-full" step="any" required />
            </div>
            <button type="button" onClick={handleGeo} className="self-end bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700">Use My Location</button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address (optional)</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Area/Neighborhood (optional)</label>
            <input type="text" value={area} onChange={e => setArea(e.target.value)} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="border rounded px-2 py-1 w-full" rows={3} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-accent-500 hover:bg-blue text-white font-semibold py-2 px-4 rounded shadow transition"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contribute; 