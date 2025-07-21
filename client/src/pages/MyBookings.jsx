import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MyBookings = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [payStatus, setPayStatus] = useState(null);
  const [payError, setPayError] = useState(null);

  const handleMpesaPay = async (bookingId) => {
    setPayingId(bookingId);
    setPayStatus(null);
    setPayError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/payments/mpesa`, { bookingId, phone: mpesaPhone });
      setPayStatus('M-PESA payment initiated! (simulated)');
    } catch (err) {
      setPayError('Failed to initiate M-PESA payment');
    }
    setPayingId(null);
    setMpesaPhone('');
  };

  const handleBankProof = async (bookingId) => {
    setPayingId(bookingId);
    setPayStatus(null);
    setPayError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/payments/bank-proof`, { bookingId, reference: bankRef });
      setPayStatus('Bank payment proof submitted! (simulated)');
    } catch (err) {
      setPayError('Failed to submit bank payment proof');
    }
    setPayingId(null);
    setBankRef('');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/bookings`);
        setBookings(res.data.bookings || []);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">My Bookings</h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-500">No bookings yet.</div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div key={b._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-semibold text-primary-700">{b.listingId?.title}</div>
                    <div className="text-gray-600 text-sm">{b.listingId?.address?.city}, {b.listingId?.address?.street}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>{b.status}</span>
                </div>
                <div className="text-sm mb-1">Date: {b.appointmentDate?.slice(0,10)} Time: {b.appointmentTime}</div>
                <div className="text-sm mb-1">Agent: {b.agentId?.profile?.bio ? b.agentId.userId?.name : b.agentId?.name}</div>
                <div className="text-sm mb-1">Service: {b.serviceType}</div>
                <div className="text-sm mb-1">Price: KES {b.pricing?.totalAmount?.toLocaleString()}</div>
                {b.specialRequirements?.length > 0 && <div className="text-sm mb-1">Special: {b.specialRequirements.join(', ')}</div>}
                {/* Add cancel/feedback buttons here if needed */}
                {/* Payment options for unpaid bookings (simulate: show for all) */}
                <div className="mt-2 space-y-2">
                  <div className="font-semibold">Payment Options:</div>
                  <form onSubmit={e => { e.preventDefault(); handleMpesaPay(b._id); }} className="flex gap-2 items-center">
                    <input type="tel" placeholder="M-PESA Phone" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} className="border rounded px-2 py-1" required />
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Pay with M-PESA</button>
                  </form>
                  <form onSubmit={e => { e.preventDefault(); handleBankProof(b._id); }} className="flex gap-2 items-center">
                    <input type="text" placeholder="Bank Ref/Code" value={bankRef} onChange={e => setBankRef(e.target.value)} className="border rounded px-2 py-1" required />
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Submit Bank Proof</button>
                  </form>
                  {payingId === b._id && <div className="text-sm text-gray-500">Processing...</div>}
                  {payStatus && <div className="text-green-600 text-sm">{payStatus}</div>}
                  {payError && <div className="text-red-600 text-sm">{payError}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings; 