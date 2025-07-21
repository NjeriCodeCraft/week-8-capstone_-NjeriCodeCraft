import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const { user, isAuthenticated, reloadUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Change password state
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(null);

  // Notification Preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, sms: false, whatsapp: false });
  const [npLoading, setNpLoading] = useState(false);
  const [npError, setNpError] = useState(null);
  const [npSuccess, setNpSuccess] = useState(null);

  // Avatar upload state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  // Contribution Stats state
  const [contributionStats, setContributionStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/me`);
        setProfile(res.data.user);
        setFavorites(res.data.favorites || []);
        setForm({ name: res.data.user.name, phone: res.data.user.phone });
        setNotificationPrefs(res.data.notificationPreferences || { email: true, sms: false, whatsapp: false });
        setContributionStats(res.data.contributionStats || { total: 0, approved: 0, pending: 0, rejected: 0 });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({ name: profile.name, phone: profile.phone });
  };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.put(`${API_BASE_URL}/api/users/me`, form);
      setProfile({ ...profile, ...form });
      setEditMode(false);
      reloadUser();
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavorite = async (listingId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/users/favorites/${listingId}`);
      setFavorites(favorites.filter(l => l._id !== listingId));
      reloadUser();
    } catch (err) {
      setError('Failed to remove favorite');
    }
  };

  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/users/change-password`, {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess('Password changed successfully!');
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
    setPwLoading(false);
  };

  const handleNpChange = (e) => {
    setNotificationPrefs({ ...notificationPrefs, [e.target.name]: e.target.checked });
  };
  const handleNpSave = async (e) => {
    e.preventDefault();
    setNpLoading(true);
    setNpError(null);
    setNpSuccess(null);
    try {
      await axios.put(`${API_BASE_URL}/api/users/notification-preferences`, notificationPrefs);
      setNpSuccess('Preferences updated!');
    } catch (err) {
      setNpError('Failed to update preferences');
    }
    setNpLoading(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      const res = await axios.post(`${API_BASE_URL}/api/users/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, profile: { ...profile.profile, avatar: res.data.avatar } });
      setAvatar(null);
      setAvatarPreview(null);
    } catch (err) {
      setAvatarError('Failed to upload avatar');
    }
    setAvatarUploading(false);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">My Profile</h2>
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-2">
            <img
              src={avatarPreview || profile?.profile?.avatar || '/default-avatar.png'}
              alt="avatar"
              className="h-24 w-24 rounded-full object-cover border"
            />
          </div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatar && (
            <button
              onClick={handleAvatarUpload}
              className="mt-2 bg-accent-500 text-white px-4 py-1 rounded hover:bg-blue transition"
              disabled={avatarUploading}
            >
              {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
            </button>
          )}
          {avatarError && <div className="text-red-600 text-sm">{avatarError}</div>}
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Name:</span>
            {editMode ? (
              <input name="name" value={form.name} onChange={handleChange} className="border rounded px-2 py-1" />
            ) : (
              <span>{profile.name}</span>
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Email:</span>
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Phone:</span>
            {editMode ? (
              <input name="phone" value={form.phone} onChange={handleChange} className="border rounded px-2 py-1" />
            ) : (
              <span>{profile.phone}</span>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            {editMode ? (
              <>
                <button onClick={handleSave} disabled={saving} className="bg-accent-500 text-white px-4 py-2 rounded hover:bg-blue transition">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={handleCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
              </>
            ) : (
              <button onClick={handleEdit} className="bg-accent-500 text-white px-4 py-2 rounded hover:bg-blue transition">Edit Profile</button>
            )}
          </div>
        </div>
        {/* Rewards / Stats section */}
        <div className="mb-6 bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow-inner">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Rewards / Stats</h3>
          <div className="text-3xl font-bold text-blue-800 mb-1">{profile.points ?? 0} pts</div>
          <div className="text-sm text-blue-600 mb-4">Points earned for approved contributions</div>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-blue-700">Total</span>
              <span className="text-lg font-bold">{contributionStats.total}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-green-700">Approved</span>
              <span className="text-lg font-bold">{contributionStats.approved}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-yellow-700">Pending</span>
              <span className="text-lg font-bold">{contributionStats.pending}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-red-700">Rejected</span>
              <span className="text-lg font-bold">{contributionStats.rejected}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Saved Listings</h3>
          {favorites.length === 0 ? (
            <div className="text-gray-500">No saved listings yet.</div>
          ) : (
            <div className="grid gap-4">
              {favorites.map(listing => (
                <div key={listing._id} className="relative">
                  <ListingCard listing={listing} />
                  <button
                    onClick={() => handleRemoveFavorite(listing._id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1 text-xs hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-10 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePwSubmit} className="space-y-4 mt-8">
            <div>
              <label className="block text-sm font-medium mb-1">Old Password</label>
              <input type="password" name="oldPassword" value={pwForm.oldPassword} onChange={handlePwChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" name="confirm" value={pwForm.confirm} onChange={handlePwChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            {pwError && <div className="text-red-600 text-sm">{pwError}</div>}
            {pwSuccess && <div className="text-green-600 text-sm">{pwSuccess}</div>}
            <button type="submit" className="w-full bg-accent-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue transition" disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
        <div className="mt-10 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
          <form onSubmit={handleNpSave} className="space-y-2 mt-8">
            <div className="flex gap-4 items-center">
              <label className="font-semibold">Notification Preferences</label>
              <label><input type="checkbox" name="email" checked={notificationPrefs.email} onChange={handleNpChange} /> Email</label>
              <label><input type="checkbox" name="sms" checked={notificationPrefs.sms} onChange={handleNpChange} /> SMS</label>
              <label><input type="checkbox" name="whatsapp" checked={notificationPrefs.whatsapp} onChange={handleNpChange} /> WhatsApp</label>
            </div>
            {npError && <div className="text-red-600 text-sm">{npError}</div>}
            {npSuccess && <div className="text-green-600 text-sm">{npSuccess}</div>}
            <button type="submit" className="bg-accent-500 text-white px-4 py-2 rounded hover:bg-blue transition" disabled={npLoading}>
              {npLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 