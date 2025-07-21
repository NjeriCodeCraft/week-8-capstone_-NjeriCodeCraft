import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getListings = async (filters = {}) => {
  // Convert filters to query string
  const params = new URLSearchParams(filters);
  const res = await axios.get(`${API_BASE_URL}/api/listings?${params.toString()}`);
  return res.data;
};

export const getListingById = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/api/listings/${id}`);
  return res.data;
}; 