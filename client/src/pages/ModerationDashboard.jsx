import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;
const contributionTypes = ['photo', 'video', 'report'];
const contributionStatuses = ['pending', 'verified', 'rejected'];

const ModerationDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilters, setTypeFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState(['pending']);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Only admin/agent can access
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'agent')) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-red-600 font-bold">Access denied: Moderation is for admins/agents only.</div>;
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchContributions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (typeFilters.length > 0) params.type = typeFilters;
      if (statusFilters.length > 0) params.status = statusFilters;
      const res = await axios.get(`${API_BASE_URL}/api/contributions`, { params });
      let filtered = res.data.contributions || [];
      // Search filter (by description, area, contributor name)
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c =>
          (c.description && c.description.toLowerCase().includes(s)) ||
          (c.location?.area && c.location.area.toLowerCase().includes(s)) ||
          (c.contributor?.name && c.contributor.name.toLowerCase().includes(s))
        );
      }
      setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
      setContributions(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } catch (err) {
      setError('Failed to load contributions');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContributions();
    // eslint-disable-next-line
  }, [typeFilters, statusFilters, search, page]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/contributions/${id}/verify`, { status: 'verified' });
      fetchContributions();
    } catch {
      alert('Failed to approve');
    }
  };
  const handleReject = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/contributions/${id}/verify`, { status: 'rejected' });
      fetchContributions();
    } catch {
      alert('Failed to reject');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-primary-700 mb-6 text-center">Moderation Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Type:</span>
          {contributionTypes.map((type) => (
            <label key={type} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={typeFilters.includes(type)}
                onChange={e => {
                  if (e.target.checked) {
                    setTypeFilters([...typeFilters, type]);
                  } else {
                    setTypeFilters(typeFilters.filter(t => t !== type));
                  }
                  setPage(1);
                }}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Status:</span>
          {contributionStatuses.map((status) => (
            <label key={status} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={statusFilters.includes(status)}
                onChange={e => {
                  if (e.target.checked) {
                    setStatusFilters([...statusFilters, status]);
                  } else {
                    setStatusFilters(statusFilters.filter(s => s !== status));
                  }
                  setPage(1);
                }}
              />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </label>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search description, area, or contributor..."
          className="border rounded px-2 py-1 text-sm"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Type</th>
                <th className="p-2">Status</th>
                <th className="p-2">Area</th>
                <th className="p-2">Description</th>
                <th className="p-2">Media</th>
                <th className="p-2">Contributor</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">No contributions found.</td></tr>
              ) : contributions.map(c => (
                <tr key={c._id} className="border-b">
                  <td className="p-2">{c.type}</td>
                  <td className="p-2 capitalize">{c.status}</td>
                  <td className="p-2">{c.location?.area || c.location?.address}</td>
                  <td className="p-2 max-w-xs truncate" title={c.description}>{c.description}</td>
                  <td className="p-2">
                    {c.mediaUrl ? (
                      c.type === 'photo' ? (
                        <img src={c.mediaUrl} alt="media" className="h-12 w-12 object-cover rounded" />
                      ) : c.type === 'video' ? (
                        <video src={c.mediaUrl} controls className="h-12 w-12 object-cover rounded" />
                      ) : null
                    ) : <span className="text-xs text-gray-400">None</span>}
                  </td>
                  <td className="p-2 text-xs">{c.contributor?.name || 'Unknown'}</td>
                  <td className="p-2 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</td>
                  <td className="p-2">
                    {c.status === 'pending' && (
                      <>
                        <button
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-2 hover:bg-green-700"
                          onClick={() => handleApprove(c._id)}
                        >Approve</button>
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          onClick={() => handleReject(c._id)}
                        >Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >Prev</button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >Next</button>
      </div>
    </div>
  );
};

export default ModerationDashboard; 