import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getListingById } from '../services/listings';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const ContactForm = ({ listing }) => {
  const [sent, setSent] = useState(false);
  return (
    <div className="mt-8 bg-card p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold text-heading mb-2">Contact Landlord/Agent</h3>
      {sent ? (
        <div className="text-green-600 font-semibold">Your message has been sent!</div>
      ) : (
        <Formik
          initialValues={{ name: '', email: '', phone: '', message: '' }}
          validate={values => {
            const errors = {};
            if (!values.name) errors.name = 'Required';
            if (!values.email) errors.email = 'Required';
            if (!values.message) errors.message = 'Required';
            return errors;
          }}
          onSubmit={(values, { resetForm }) => {
            setSent(true);
            setTimeout(() => setSent(false), 4000);
            resetForm();
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <Field name="name" className="mt-1 block w-full rounded border-gray-300" />
                {errors.name && touched.name && <div className="text-xs text-red-500">{errors.name}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Field name="email" type="email" className="mt-1 block w-full rounded border-gray-300" />
                {errors.email && touched.email && <div className="text-xs text-red-500">{errors.email}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <Field name="phone" className="mt-1 block w-full rounded border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium">Message</label>
                <Field as="textarea" name="message" rows={3} className="mt-1 block w-full rounded border-gray-300" />
                {errors.message && touched.message && <div className="text-xs text-red-500">{errors.message}</div>}
              </div>
              <button type="submit" className="bg-accent-500 hover:bg-blue text-white font-semibold py-2 px-4 rounded shadow transition">
                Send Message
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, reloadUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const isFavorited = isAuthenticated && user?.favorites?.some(fid => fid === id || fid?._id === id);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '', requirements: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: '', comment: '' });
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    getListingById(id)
      .then(setListing)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/listings/${id}/reviews`);
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating);
        setReviewCount(res.data.count);
      } catch {}
    };
    fetchReviews();
  }, [id]);

  // Google Maps Embed URL
  let mapUrl = null;
  const coords = listing?.address?.location?.coordinates;
  if (coords && coords.length === 2) {
    mapUrl = `https://www.google.com/maps?q=${coords[1]},${coords[0]}&z=16&output=embed`;
  }

  const handleDirections = () => {
    if (!coords || coords.length !== 2) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${coords[1]},${coords[0]}`;
          window.open(url, '_blank');
        },
        () => {
          // fallback: just open destination
          const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
          window.open(url, '_blank');
        }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
      window.open(url, '_blank');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users/favorites/${id}`);
      reloadUser();
    } catch {}
    setSaving(false);
  };

  const handleBookingChange = (e) => setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        listingId: listing._id,
        agentId: listing.contactInfo?.agentId,
        appointmentDate: bookingForm.date,
        appointmentTime: bookingForm.time,
        specialRequirements: bookingForm.requirements ? [bookingForm.requirements] : [],
      });
      setBookingSuccess('Booking request sent! The agent will contact you soon.');
      setShowBooking(false);
      setBookingForm({ date: '', time: '', requirements: '' });
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to create booking');
    }
    setBookingLoading(false);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!listing) return <div className="text-center py-10">Listing not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to="/" className="text-primary-600 hover:underline mb-4 inline-block">← Back to Search</Link>
      <div className="bg-white rounded-lg shadow p-6 relative">
        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          disabled={saving}
          className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-primary-100"
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          {isFavorited ? (
            <span className="text-red-600 text-2xl">♥</span>
          ) : (
            <span className="text-gray-400 text-2xl">♡</span>
          )}
        </button>
        <div className="mb-4">
          {listing.images && listing.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={listing.title}
                  className="h-48 w-64 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-primary-700 mb-2">{listing.title}</h1>
        <div className="text-lg text-primary-600 font-semibold mb-2">KES {listing.price?.toLocaleString()}</div>
        <div className="text-gray-600 mb-2">
          {listing.address?.city}, {listing.address?.street}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {Object.entries(listing.amenities || {})
            .filter(([key, value]) => value && amenityIcons[key])
            .map(([key]) => (
              <span key={key} title={key} className="text-xl" aria-label={key}>
                {amenityIcons[key]}
              </span>
            ))}
        </div>
        <div className="mb-4 text-gray-700">
          <strong>Description:</strong>
          <div>{listing.description}</div>
        </div>
        <div className="mb-4">
          <strong>Contact:</strong>
          <div>Name: {listing.contactInfo?.name}</div>
          <div>Phone: <a href={`tel:${listing.contactInfo?.phone}`} className="text-primary-600 hover:underline">{listing.contactInfo?.phone}</a></div>
          {listing.contactInfo?.email && <div>Email: <a href={`mailto:${listing.contactInfo.email}`} className="text-primary-600 hover:underline">{listing.contactInfo.email}</a></div>}
        </div>
        {mapUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Location Map</h3>
            <div className="rounded overflow-hidden border">
              <iframe
                title="Property Location"
                src={mapUrl}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <button
              onClick={handleDirections}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Get Directions
            </button>
          </div>
        )}
        {/* Book a Local Guide button (only for users, not agents) */}
        {isAuthenticated && user?.role !== 'agent' && listing.contactInfo?.agentId && (
          <div className="mb-6">
            <button
              onClick={() => setShowBooking((v) => !v)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded shadow"
            >
              {showBooking ? 'Cancel Booking' : 'Book a Local Guide'}
            </button>
            {showBooking && (
              <form onSubmit={handleBookingSubmit} className="mt-4 space-y-3 bg-gray-50 p-4 rounded">
                <div>
                  <label className="block text-sm font-medium">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={bookingForm.date}
                    onChange={handleBookingChange}
                    className="w-full rounded border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={bookingForm.time}
                    onChange={handleBookingChange}
                    className="w-full rounded border-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Special Requirements</label>
                  <input
                    type="text"
                    name="requirements"
                    value={bookingForm.requirements}
                    onChange={handleBookingChange}
                    className="w-full rounded border-gray-300"
                    placeholder="Optional"
                  />
                </div>
                {bookingError && <div className="text-red-600 text-sm">{bookingError}</div>}
                {bookingSuccess && <div className="text-green-600 text-sm">{bookingSuccess}</div>}
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded shadow"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Submit Booking Request'}
                </button>
              </form>
            )}
          </div>
        )}
        <ContactForm listing={listing} />
      </div>
      {/* Reviews section */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-semibold mb-2">Reviews & Ratings</h3>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-2xl text-yellow-500">★</span>
          <span className="text-lg font-bold">{avgRating ? avgRating : 'N/A'}</span>
          <span className="text-gray-600">({reviewCount} reviews)</span>
        </div>
        {/* Review form for users (not agents themselves) */}
        {isAuthenticated && user?.role === 'user' && (
          <form
            className="mb-4 flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setReviewError(null);
              setReviewSuccess(null);
              setSubmittingReview(true);
              try {
                await axios.post(`${API_BASE_URL}/api/listings/${id}/reviews`, reviewForm);
                setReviewSuccess('Review submitted!');
                setReviewForm({ rating: '', comment: '' });
                // Refresh reviews
                const res = await axios.get(`${API_BASE_URL}/api/listings/${id}/reviews`);
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
              className="bg-primary-600 text-white px-4 py-1 rounded hover:bg-primary-700 mt-1"
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
                <span className="font-semibold text-primary-700">{r.reviewer?.name || 'User'}</span>
                <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-700 text-sm">{r.comment}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail; 