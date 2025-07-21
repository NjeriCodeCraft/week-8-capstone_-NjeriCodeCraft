const express = require('express');
const axios = require('axios');
const router = express.Router();
console.log('Loaded payments router');
require('dotenv').config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
  MPESA_ENV
} = process.env;

const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

// Helper: Get OAuth token
async function getMpesaToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

// Helper: Get timestamp and password
function getTimestamp() {
  const date = new Date();
  return date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
}
function getPassword(timestamp) {
  return Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
}

// POST /api/payments/mpesa/stkpush
router.post('/mpesa/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const token = await getMpesaToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: 'RentRadar',
      TransactionDesc: 'Payment for booking'
    };

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

// POST /api/payments/mpesa/callback
router.post('/mpesa/callback', async (req, res) => {
  // Safaricom will POST payment result here
  // You should verify, update booking/payment status, etc.
  console.log('M-PESA Callback:', JSON.stringify(req.body, null, 2));
  // TODO: Save result to DB, update booking/payment status
  res.json({ result: 'Received' });
});

module.exports = router; 