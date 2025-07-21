import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AddListingForm from '../components/AddListingForm';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AgentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [agentProfile, setAgentProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: '', comment: '' });
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'agent') {
      navigate('/agent/register');
      return;
    }

    loadAgentData();
  }, [isAuthenticated, user, navigate]);

  const loadAgentData = async () => {
    try {
      const [profileRes, listingsRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/agents/profile`),
        axios.get(`${API_BASE_URL}/api/agents/listings`),
        axios.get(`${API_BASE_URL}/api/bookings`)
      ]);
      setAgentProfile(profileRes.data.agent);
      setListings(listingsRes.data.listings);
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      setError('Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch agent reviews
  useEffect(() => {
    if (!agentProfile?._id) return;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/agents/${agentProfile._id}/reviews`);
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating);
        setReviewCount(res.data.count);
      } catch {}
    };
    fetchReviews();
  }, [agentProfile?._id]);

  const handleListingSuccess = () => {
    loadAgentData();
    setActiveTab('listings');
  };

  const handleBookingAction = async (id, status) => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/${id}`, { status });
      // Refresh bookings
      const res = await axios.get(`${API_BASE_URL}/api/bookings`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      setBookingsError('Failed to update booking');
    }
    setBookingsLoading(false);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'listings', label: 'My Listings' },
    { id: 'add-listing', label: 'Add Listing' },
    { id: 'profile', label: 'Profile' },
    { id: 'bookings', label: 'Booking Requests' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-card rounded-lg shadow">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-heading">Agent Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-accent-500 text-accent-500'
                      : 'border-transparent text-gray-500 hover:text-blue hover:border-blue'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue">Total Listings</h3>
                  <p className="text-3xl font-bold text-blue">{listings.length}</p>
                </div>
                <div className="bg-accent-500/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-accent-500">Active Listings</h3>
                  <p className="text-3xl font-bold text-accent-500">
                    {listings.filter(l => l.isAvailable).length}
                  </p>
                </div>
                <div className="bg-blue/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue">Base Rate</h3>
                  <p className="text-3xl font-bold text-blue">
                    KES {agentProfile?.pricing?.baseRate?.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-heading">My Listings</h2>
                  <button
                    onClick={() => setActiveTab('add-listing')}
                    className="bg-accent-500 text-white px-4 py-2 rounded hover:bg-blue"
                  >
                    Add New Listing
                  </button>
                </div>
                {listings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No listings yet. Add your first listing!
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {listings.map((listing) => (
                      <div key={listing._id} className="border rounded-lg p-4 bg-card">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-heading">{listing.title}</h3>
                            <p className="text-gray-600">{listing.address?.city}, {listing.address?.street}</p>
                            <p className="text-blue font-semibold">KES {listing.price?.toLocaleString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            listing.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {listing.isAvailable ? 'Available' : 'Rented'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'add-listing' && (
              <AddListingForm 
                onSuccess={handleListingSuccess}
                onCancel={() => setActiveTab('listings')}
              />
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Agent Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Bio</label>
                    <p className="mt-1 text-gray-700">{agentProfile?.profile?.bio}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Experience</label>
                      <p className="mt-1 text-gray-700">{agentProfile?.profile?.experience} years</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Base Rate</label>
                      <p className="mt-1 text-gray-700">KES {agentProfile?.pricing?.baseRate?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Languages</label>
                    <p className="mt-1 text-gray-700">{agentProfile?.profile?.languages?.join(', ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Specializations</label>
                    <p className="mt-1 text-gray-700">{agentProfile?.profile?.specializations?.join(', ')}</p>
                  </div>
                  {/* Reviews section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Reviews & Ratings</h3>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl text-yellow-500">★</span>
                      <span className="text-lg font-bold">{avgRating ? avgRating : 'N/A'}</span>
                      <span className="text-gray-600">({reviewCount} reviews)</span>
                    </div>
                    {/* Review form for users (not agents themselves) */}
                    {user && user.role === 'user' && (
                      <form
                        className="mb-4 flex flex-col gap-2"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setReviewError(null);
                          setReviewSuccess(null);
                          setSubmittingReview(true);
                          try {
                            await axios.post(`${API_BASE_URL}/api/agents/${agentProfile._id}/reviews`, reviewForm);
                            setReviewSuccess('Review submitted!');
                            setReviewForm({ rating: '', comment: '' });
                            // Refresh reviews
                            const res = await axios.get(`${API_BASE_URL}/api/agents/${agentProfile._id}/reviews`);
                            setReviews(res.data.reviews || []);
                            setAvgRating(res.data.avgRating);
                            setReviewCount(res.data.count);
                          } catch (err) {
                            setReviewError(err.response?.data?.message || 'Failed to submit review');
                          }
                          setSubmittingReview(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <label className="font-semibold">Your Rating:</label>
                          <select
                            value={reviewForm.rating}
                            onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })}
                            className="border rounded px-2 py-1"
                            required
                          >
                            <option value="">Select</option>
                            {[1,2,3,4,5].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          <span className="text-yellow-500">★</span>
                        </div>
                        <textarea
                          value={reviewForm.comment}
                          onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="border rounded px-2 py-1"
                          placeholder="Write a comment (optional)"
                          rows={2}
                          maxLength={1000}
                        />
                        {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
                        {reviewSuccess && <div className="text-green-600 text-sm">{reviewSuccess}</div>}
                        <button
                          type="submit"
                          className="bg-accent-500 text-white px-4 py-1 rounded hover:bg-blue mt-1"
                          disabled={submittingReview}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                    {/* Reviews list */}
                    <div className="divide-y">
                      {reviews.length === 0 ? (
                        <div className="text-gray-500 py-4">No reviews yet.</div>
                      ) : reviews.map(r => (
                        <div key={r._id} className="py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-accent-700">{r.reviewer?.name || 'User'}</span>
                            <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-gray-700 text-sm mb-1">{r.comment}</div>
                          {/* Agent reply */}
                          {r.reply && r.reply.text ? (
                            <div className="ml-6 mt-1 p-2 bg-blue-50 rounded">
                              <span className="font-semibold text-blue-700">Agent Reply:</span>
                              <span className="ml-2 text-gray-800">{r.reply.text}</span>
                              <span className="ml-2 text-xs text-gray-400">{r.reply.date ? new Date(r.reply.date).toLocaleDateString() : ''}</span>
                            </div>
                          ) : (user && user.role === 'agent' && (
                            <div className="ml-6 mt-1">
                              {replyingTo === r._id ? (
                                <form
                                  className="flex flex-col gap-2"
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    setReplyError(null);
                                    setReplySuccess(null);
                                    setSubmittingReply(true);
                                    try {
                                      await axios.put(`${API_BASE_URL}/api/agents/reviews/${r._id}/reply`, { text: replyText });
                                      setReplySuccess('Reply posted!');
                                      setReplyText('');
                                      setReplyingTo(null);
                                      // Refresh reviews
                                      const res = await axios.get(`${API_BASE_URL}/api/agents/${agentProfile._id}/reviews`);
                                      setReviews(res.data.reviews || []);
                                      setAvgRating(res.data.avgRating);
                                      setReviewCount(res.data.count);
                                    } catch (err) {
                                      setReplyError(err.response?.data?.message || 'Failed to post reply');
                                    }
                                    setSubmittingReply(false);
                                  }}
                                >
                                  <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    className="border rounded px-2 py-1"
                                    placeholder="Write a reply..."
                                    rows={2}
                                    maxLength={1000}
                                    required
                                  />
                                  {replyError && <div className="text-red-600 text-sm">{replyError}</div>}
                                  {replySuccess && <div className="text-green-600 text-sm">{replySuccess}</div>}
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      type="submit"
                                      className="bg-accent-500 text-white px-3 py-1 rounded hover:bg-blue text-sm"
                                      disabled={submittingReply}
                                    >
                                      {submittingReply ? 'Replying...' : 'Post Reply'}
                                    </button>
                                    <button
                                      type="button"
                                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                                      onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                    >Cancel</button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  className="text-xs text-blue-600 hover:underline"
                                  onClick={() => { setReplyingTo(r._id); setReplyText(''); setReplyError(null); setReplySuccess(null); }}
                                >Reply</button>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Booking Requests</h2>
                {bookingsLoading ? (
                  <div className="text-center">Loading...</div>
                ) : bookingsError ? (
                  <div className="text-center text-red-500">{bookingsError}</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center text-gray-500">No booking requests yet.</div>
                ) : (
                  <div className="space-y-6">
                    {bookings.map((b) => (
                      <div key={b._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-semibold text-accent-700">{b.listingId?.title}</div>
                            <div className="text-gray-600 text-sm">{b.listingId?.address?.city}, {b.listingId?.address?.street}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>{b.status}</span>
                        </div>
                        <div className="text-sm mb-1">Date: {b.appointmentDate?.slice(0,10)} Time: {b.appointmentTime}</div>
                        <div className="text-sm mb-1">User: {b.userId?.name}</div>
                        <div className="text-sm mb-1">Service: {b.serviceType}</div>
                        <div className="text-sm mb-1">Price: KES {b.pricing?.totalAmount?.toLocaleString()}</div>
                        {b.specialRequirements?.length > 0 && <div className="text-sm mb-1">Special: {b.specialRequirements.join(', ')}</div>}
                        {b.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleBookingAction(b._id, 'confirmed')} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Accept</button>
                            <button onClick={() => handleBookingAction(b._id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleBookingAction(b._id, 'completed')} className="bg-accent-500 text-white px-3 py-1 rounded hover:bg-blue">Mark as Completed</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard; 