import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import exportToCSV from '../utils/exportToCSV';
import Modal from '../components/Modal';

const sections = [
  { id: 'users', label: 'Users' },
  { id: 'agents', label: 'Agents' },
  { id: 'listings', label: 'Listings' },
  { id: 'contributions', label: 'Contributions' },
  { id: 'reports', label: 'Reports' },
];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [agents, setAgents] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDetails, setAgentDetails] = useState(null);
  const [agentModalLoading, setAgentModalLoading] = useState(false);
  const [editAgentMode, setEditAgentMode] = useState(false);
  const [editAgentForm, setEditAgentForm] = useState({ bio: '', experience: '', specializations: '', languages: '' });
  const [listings, setListings] = useState([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingDetails, setListingDetails] = useState(null);
  const [listingModalLoading, setListingModalLoading] = useState(false);
  const [editListingMode, setEditListingMode] = useState(false);
  const [editListingForm, setEditListingForm] = useState({ title: '', price: '', status: '' });
  const [contributions, setContributions] = useState([]);
  const [contributionLoading, setContributionLoading] = useState(false);
  const [contributionError, setContributionError] = useState(null);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [contributionDetails, setContributionDetails] = useState(null);
  const [contributionModalLoading, setContributionModalLoading] = useState(false);
  const [contributionTypeFilter, setContributionTypeFilter] = useState('');
  const [contributionStatusFilter, setContributionStatusFilter] = useState('');
  const [contributionSearch, setContributionSearch] = useState('');
  const [adjustPointsMode, setAdjustPointsMode] = useState(false);
  const [pointsInput, setPointsInput] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [usersPerMonth, setUsersPerMonth] = useState([]);
  const [usersPerMonthLoading, setUsersPerMonthLoading] = useState(false);
  const [usersPerMonthError, setUsersPerMonthError] = useState(null);
  const [listingsPerMonth, setListingsPerMonth] = useState([]);
  const [listingsPerMonthLoading, setListingsPerMonthLoading] = useState(false);
  const [listingsPerMonthError, setListingsPerMonthError] = useState(null);
  const [bookingsPerMonth, setBookingsPerMonth] = useState([]);
  const [bookingsPerMonthLoading, setBookingsPerMonthLoading] = useState(false);
  const [bookingsPerMonthError, setBookingsPerMonthError] = useState(null);

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers();
    } else if (activeSection === 'agents') {
      fetchAgents();
    } else if (activeSection === 'listings') {
      fetchListings();
    } else if (activeSection === 'contributions') {
      fetchContributions();
    } else if (activeSection === 'reports') {
      fetchStats();
      fetchUsersPerMonth();
      fetchListingsPerMonth();
      fetchBookingsPerMonth();
    }
    // Add more fetches for other sections as needed
    // eslint-disable-next-line
  }, [activeSection]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  };

  const fetchAgents = async () => {
    setAgentLoading(true);
    setAgentError(null);
    try {
      const res = await axios.get('/api/admin/agents');
      setAgents(res.data.agents || []);
    } catch (err) {
      setAgentError('Failed to fetch agents');
      toast.error('Failed to fetch agents');
    }
    setAgentLoading(false);
  };

  const fetchListings = async () => {
    setListingLoading(true);
    setListingError(null);
    try {
      const res = await axios.get('/api/admin/listings');
      setListings(res.data.listings || []);
    } catch (err) {
      setListingError('Failed to fetch listings');
      toast.error('Failed to fetch listings');
    }
    setListingLoading(false);
  };

  const fetchContributions = async () => {
    setContributionLoading(true);
    setContributionError(null);
    try {
      const res = await axios.get('/api/admin/contributions');
      setContributions(res.data.contributions || []);
    } catch (err) {
      setContributionError('Failed to fetch contributions');
      toast.error('Failed to fetch contributions');
    }
    setContributionLoading(false);
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats || null);
    } catch (err) {
      setStatsError('Failed to fetch stats');
      toast.error('Failed to fetch stats');
    }
    setStatsLoading(false);
  };

  const fetchUsersPerMonth = async () => {
    setUsersPerMonthLoading(true);
    setUsersPerMonthError(null);
    try {
      const res = await axios.get('/api/admin/stats/users-per-month');
      setUsersPerMonth(res.data.data || []);
    } catch (err) {
      setUsersPerMonthError('Failed to fetch users per month');
      toast.error('Failed to fetch users per month');
    }
    setUsersPerMonthLoading(false);
  };

  const fetchListingsPerMonth = async () => {
    setListingsPerMonthLoading(true);
    setListingsPerMonthError(null);
    try {
      const res = await axios.get('/api/admin/stats/listings-per-month');
      setListingsPerMonth(res.data.data || []);
    } catch (err) {
      setListingsPerMonthError('Failed to fetch listings per month');
      toast.error('Failed to fetch listings per month');
    }
    setListingsPerMonthLoading(false);
  };

  const fetchBookingsPerMonth = async () => {
    setBookingsPerMonthLoading(true);
    setBookingsPerMonthError(null);
    try {
      const res = await axios.get('/api/admin/stats/bookings-per-month');
      setBookingsPerMonth(res.data.data || []);
    } catch (err) {
      setBookingsPerMonthError('Failed to fetch bookings per month');
      toast.error('Failed to fetch bookings per month');
    }
    setBookingsPerMonthLoading(false);
  };

  const handleToggleActive = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle-active`);
      fetchUsers();
      toast.success('User status updated successfully');
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleEditUser = (user) => {
    setEditForm({ name: user.name, email: user.email, phone: user.phone, role: user.role });
    setSelectedUser(user);
    setEditMode(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}`, editForm);
      setEditMode(false);
      setSelectedUser(null);
      fetchUsers();
      toast.success('User updated successfully');
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setDeleteConfirm(null);
      fetchUsers();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset this user\'s password? They will need to use the new password to log in.')) return;
    try {
      const res = await axios.put(`/api/admin/users/${userId}/reset-password`);
      toast.success(`Temporary password sent to user: ${res.data.tempPassword}`);
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const handleViewAgent = async (agentId) => {
    setAgentModalLoading(true);
    setSelectedAgent(agentId);
    try {
      const res = await axios.get(`/api/admin/agents/${agentId}`);
      setAgentDetails(res.data.agent);
    } catch {
      setAgentDetails(null);
    }
    setAgentModalLoading(false);
  };

  const handleApproveAgent = async (agentId) => {
    try {
      await axios.put(`/api/admin/agents/${agentId}/approve`);
      fetchAgents();
      toast.success('Agent approved successfully');
    } catch {
      toast.error('Failed to approve agent');
    }
  };

  const handleRejectAgent = async (agentId) => {
    try {
      await axios.put(`/api/admin/agents/${agentId}/reject`);
      fetchAgents();
      toast.success('Agent rejected successfully');
    } catch {
      toast.error('Failed to reject agent');
    }
  };

  const handleToggleAgentActive = async (agentId) => {
    try {
      await axios.put(`/api/admin/agents/${agentId}/toggle-active`);
      fetchAgents();
      toast.success('Agent status updated successfully');
    } catch {
      toast.error('Failed to update agent status');
    }
  };

  const handleEditAgent = (agent) => {
    setEditAgentForm({
      bio: agent.profile?.bio || '',
      experience: agent.profile?.experience || '',
      specializations: agent.profile?.specializations?.join(', ') || '',
      languages: agent.profile?.languages?.join(', ') || '',
    });
    setAgentDetails(agent);
    setEditAgentMode(true);
    setSelectedAgent(agent._id);
  };

  const handleEditAgentFormChange = (e) => {
    setEditAgentForm({ ...editAgentForm, [e.target.name]: e.target.value });
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/agents/${selectedAgent}`, {
        bio: editAgentForm.bio,
        experience: editAgentForm.experience,
        specializations: editAgentForm.specializations.split(',').map(s => s.trim()),
        languages: editAgentForm.languages.split(',').map(l => l.trim()),
      });
      setEditAgentMode(false);
      setSelectedAgent(null);
      setAgentDetails(null);
      fetchAgents();
      toast.success('Agent updated successfully');
    } catch {
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/agents/${agentId}`);
      setSelectedAgent(null);
      setAgentDetails(null);
      fetchAgents();
      toast.success('Agent deleted successfully');
    } catch {
      toast.error('Failed to delete agent');
    }
  };

  const handleViewListing = async (listingId) => {
    setListingModalLoading(true);
    setSelectedListing(listingId);
    try {
      const res = await axios.get(`/api/admin/listings/${listingId}`);
      setListingDetails(res.data.listing);
    } catch {
      setListingDetails(null);
    }
    setListingModalLoading(false);
  };

  const handleApproveListing = async (listingId) => {
    try {
      await axios.put(`/api/admin/listings/${listingId}/approve`);
      fetchListings();
      toast.success('Listing approved successfully');
    } catch {
      toast.error('Failed to approve listing');
    }
  };

  const handleRejectListing = async (listingId) => {
    try {
      await axios.put(`/api/admin/listings/${listingId}/reject`);
      fetchListings();
      toast.success('Listing rejected successfully');
    } catch {
      toast.error('Failed to reject listing');
    }
  };

  const handleEditListing = (listing) => {
    setEditListingForm({
      title: listing.title || '',
      price: listing.price || '',
      status: listing.status || '',
    });
    setListingDetails(listing);
    setEditListingMode(true);
    setSelectedListing(listing._id);
  };

  const handleEditListingFormChange = (e) => {
    setEditListingForm({ ...editListingForm, [e.target.name]: e.target.value });
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/listings/${selectedListing}`, {
        title: editListingForm.title,
        price: editListingForm.price,
        status: editListingForm.status,
      });
      setEditListingMode(false);
      setSelectedListing(null);
      setListingDetails(null);
      fetchListings();
      toast.success('Listing updated successfully');
    } catch {
      toast.error('Failed to update listing');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/listings/${listingId}`);
      setSelectedListing(null);
      setListingDetails(null);
      fetchListings();
      toast.success('Listing deleted successfully');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleViewContribution = async (contributionId) => {
    setContributionModalLoading(true);
    setSelectedContribution(contributionId);
    try {
      const res = await axios.get(`/api/admin/contributions/${contributionId}`);
      setContributionDetails(res.data.contribution);
    } catch {
      setContributionDetails(null);
    }
    setContributionModalLoading(false);
  };

  const handleApproveContribution = async (contributionId) => {
    try {
      await axios.put(`/api/admin/contributions/${contributionId}/approve`);
      fetchContributions();
      toast.success('Contribution approved successfully');
    } catch {
      toast.error('Failed to approve contribution');
    }
  };

  const handleRejectContribution = async (contributionId) => {
    try {
      await axios.put(`/api/admin/contributions/${contributionId}/reject`);
      fetchContributions();
      toast.success('Contribution rejected successfully');
    } catch {
      toast.error('Failed to reject contribution');
    }
  };

  const handleAdjustPoints = () => {
    setPointsInput(contributionDetails?.points?.toString() || '');
    setAdjustPointsMode(true);
  };

  const handleSavePoints = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/contributions/${selectedContribution}/points`, { points: Number(pointsInput) });
      setAdjustPointsMode(false);
      // Refresh modal details
      const res = await axios.get(`/api/admin/contributions/${selectedContribution}`);
      setContributionDetails(res.data.contribution);
      fetchContributions();
      toast.success('Points updated successfully');
    } catch {
      toast.error('Failed to update points');
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered contributions
  const filteredContributions = contributions.filter(c =>
    (!contributionTypeFilter || c.type === contributionTypeFilter) &&
    (!contributionStatusFilter || c.status === contributionStatusFilter) &&
    (!contributionSearch ||
      (c.contributor?.name || '').toLowerCase().includes(contributionSearch.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(contributionSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow h-screen p-6">
        <h2 className="text-xl font-bold text-primary-700 mb-8">Admin Dashboard</h2>
        <nav className="flex flex-col gap-4">
          {sections.map((s) => (
            <button
              key={s.id}
              className={`text-left px-4 py-2 rounded-lg font-medium ${activeSection === s.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeSection === 'users' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Users</h3>
            <div className="mb-4 flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded px-3 py-2 w-72"
              />
              <button
                className="ml-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => exportToCSV(filteredUsers, 'users.csv')}
                disabled={filteredUsers.length === 0}
              >
                Export CSV
              </button>
            </div>
            {loading && <Spinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Email</th>
                      <th className="py-2 px-4 border-b">Phone</th>
                      <th className="py-2 px-4 border-b">Role</th>
                      <th className="py-2 px-4 border-b">Status</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{user.name}</td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.phone}</td>
                        <td className="py-2 px-4 border-b capitalize">{user.role}</td>
                        <td className="py-2 px-4 border-b">{user.isActive ? 'Active' : 'Inactive'}</td>
                        <td className="py-2 px-4 border-b flex flex-wrap gap-1">
                          <button
                            className="text-primary-600 hover:underline text-sm px-2 py-1 rounded"
                            onClick={() => setSelectedUser(user)}
                          >
                            View
                          </button>
                          <button
                            className={`text-sm px-2 py-1 rounded ${user.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            onClick={() => handleToggleActive(user._id)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="text-blue-600 hover:underline text-sm px-2 py-1 rounded"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-600 text-white hover:bg-red-700 text-sm px-2 py-1 rounded ml-2"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                          <button
                            className="text-yellow-600 hover:underline text-sm px-2 py-1 rounded"
                            onClick={() => handleResetPassword(user._id)}
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* User Details Modal */}
            <Modal isOpen={!!selectedUser && !editMode} onClose={() => setSelectedUser(null)}>
              <h4 className="text-xl font-bold mb-4">User Details</h4>
              <div className="mb-2"><span className="font-semibold">Name:</span> {selectedUser?.name}</div>
              <div className="mb-2"><span className="font-semibold">Email:</span> {selectedUser?.email}</div>
              <div className="mb-2"><span className="font-semibold">Phone:</span> {selectedUser?.phone}</div>
              <div className="mb-2"><span className="font-semibold">Role:</span> {selectedUser?.role}</div>
              <div className="mb-2"><span className="font-semibold">Status:</span> {selectedUser?.isActive ? 'Active' : 'Inactive'}</div>
            </Modal>
            {/* Edit User Modal */}
            <Modal isOpen={!!selectedUser && editMode} onClose={() => { setEditMode(false); setSelectedUser(null); }}>
              <h4 className="text-xl font-bold mb-4">Edit User</h4>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditFormChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  >
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                    onClick={() => { setEditMode(false); setSelectedUser(null); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}
        {activeSection === 'agents' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Agents</h3>
            <div className="mb-4 flex items-center gap-4">
              {/* Add any agent search/filter inputs here */}
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => exportToCSV(agents, 'agents.csv')}
                disabled={agents.length === 0}
              >
                Export CSV
              </button>
            </div>
            {agentLoading && <Spinner />}
            {agentError && <ErrorMessage message={agentError} />}
            {!agentLoading && !agentError && (
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{agent.profile?.name || agent.userId?.name || '-'}</td>
                      <td className="py-2 px-4 border-b">{agent.userId?.email || '-'}</td>
                      <td className="py-2 px-4 border-b capitalize">{agent.verificationStatus}</td>
                      <td className="py-2 px-4 border-b">
                        <button className="text-primary-600 hover:underline mr-2" onClick={() => handleViewAgent(agent._id)}>View</button>
                        <button className="text-green-600 hover:underline mr-2" onClick={() => handleApproveAgent(agent._id)}>Approve</button>
                        <button className="text-red-600 hover:underline mr-2" onClick={() => handleRejectAgent(agent._id)}>Reject</button>
                        <button className="text-yellow-600 hover:underline mr-2" onClick={() => handleToggleAgentActive(agent._id)}>
                          {agent.availability?.isAvailable ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEditAgent(agent)}>Edit</button>
                        <button className="bg-red-600 text-white hover:bg-red-700 text-sm px-2 py-1 rounded" onClick={() => handleDeleteAgent(agent._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Agent Details Modal */}
            <Modal isOpen={!!selectedAgent && !editAgentMode} onClose={() => { setSelectedAgent(null); setAgentDetails(null); }}>
              <h4 className="text-xl font-bold mb-4">Agent Details</h4>
              {agentModalLoading ? (
                <Spinner />
              ) : agentDetails ? (
                <div>
                  <div className="mb-2"><span className="font-semibold">Name:</span> {agentDetails.profile?.name || agentDetails.userId?.name || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Email:</span> {agentDetails.userId?.email || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Phone:</span> {agentDetails.userId?.phone || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Bio:</span> {agentDetails.profile?.bio || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Experience:</span> {agentDetails.profile?.experience || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Specializations:</span> {agentDetails.profile?.specializations?.join(', ') || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Languages:</span> {agentDetails.profile?.languages?.join(', ') || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Status:</span> {agentDetails.verificationStatus}</div>
                </div>
              ) : (
                <ErrorMessage message="Failed to load agent details." />
              )}
            </Modal>
            {/* Edit Agent Modal */}
            <Modal isOpen={!!selectedAgent && editAgentMode} onClose={() => { setEditAgentMode(false); setSelectedAgent(null); setAgentDetails(null); }}>
              <h4 className="text-xl font-bold mb-4">Edit Agent</h4>
              <form onSubmit={handleUpdateAgent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <input
                    type="text"
                    name="bio"
                    value={editAgentForm.bio}
                    onChange={handleEditAgentFormChange}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={editAgentForm.experience}
                    onChange={handleEditAgentFormChange}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specializations (comma separated)</label>
                  <input
                    type="text"
                    name="specializations"
                    value={editAgentForm.specializations}
                    onChange={handleEditAgentFormChange}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    name="languages"
                    value={editAgentForm.languages}
                    onChange={handleEditAgentFormChange}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                    onClick={() => { setEditAgentMode(false); setSelectedAgent(null); setAgentDetails(null); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}
        {activeSection === 'listings' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Listings</h3>
            <div className="mb-4 flex items-center gap-4">
              {/* Add any listing search/filter inputs here */}
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => exportToCSV(listings, 'listings.csv')}
                disabled={listings.length === 0}
              >
                Export CSV
              </button>
            </div>
            {listingLoading && <Spinner />}
            {listingError && <ErrorMessage message={listingError} />}
            {!listingLoading && !listingError && (
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Title</th>
                    <th className="py-2 px-4 border-b">City</th>
                    <th className="py-2 px-4 border-b">Price</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Owner/Agent</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{listing.title}</td>
                      <td className="py-2 px-4 border-b">{listing.address?.city || '-'}</td>
                      <td className="py-2 px-4 border-b">KES {listing.price?.toLocaleString()}</td>
                      <td className="py-2 px-4 border-b capitalize">{listing.status}</td>
                      <td className="py-2 px-4 border-b">{listing.contactInfo?.name || '-'}</td>
                      <td className="py-2 px-4 border-b">
                        <button className="text-primary-600 hover:underline mr-2" onClick={() => handleViewListing(listing._id)}>View</button>
                        <button className="text-green-600 hover:underline mr-2" onClick={() => handleApproveListing(listing._id)}>Approve</button>
                        <button className="text-red-600 hover:underline mr-2" onClick={() => handleRejectListing(listing._id)}>Reject</button>
                        <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEditListing(listing)}>Edit</button>
                        <button className="bg-red-600 text-white hover:bg-red-700 text-sm px-2 py-1 rounded" onClick={() => handleDeleteListing(listing._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Listing Details Modal */}
            <Modal isOpen={!!selectedListing && !editListingMode} onClose={() => { setSelectedListing(null); setListingDetails(null); }} width="max-w-lg">
              <h4 className="text-xl font-bold mb-4">Listing Details</h4>
              {listingModalLoading ? (
                <Spinner />
              ) : listingDetails ? (
                <div>
                  <div className="mb-2"><span className="font-semibold">Title:</span> {listingDetails.title}</div>
                  <div className="mb-2"><span className="font-semibold">Price:</span> KES {listingDetails.price?.toLocaleString()}</div>
                  <div className="mb-2"><span className="font-semibold">Status:</span> {listingDetails.status}</div>
                  <div className="mb-2"><span className="font-semibold">City:</span> {listingDetails.address?.city || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Contact Name:</span> {listingDetails.contactInfo?.name || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Contact Phone:</span> {listingDetails.contactInfo?.phone || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Description:</span> {listingDetails.description || '-'}</div>
                </div>
              ) : (
                <ErrorMessage message="Failed to load listing details." />
              )}
            </Modal>
            {/* Edit Listing Modal */}
            <Modal isOpen={!!selectedListing && editListingMode} onClose={() => { setEditListingMode(false); setSelectedListing(null); setListingDetails(null); }} width="max-w-lg">
              <h4 className="text-xl font-bold mb-4">Edit Listing</h4>
              <form onSubmit={handleUpdateListing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editListingForm.title}
                    onChange={handleEditListingFormChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={editListingForm.price}
                    onChange={handleEditListingFormChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={editListingForm.status}
                    onChange={handleEditListingFormChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                    onClick={() => { setEditListingMode(false); setSelectedListing(null); setListingDetails(null); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}
        {activeSection === 'contributions' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contributions</h3>
            <div className="mb-4 flex items-center gap-4">
              {/* Add any contribution search/filter inputs here */}
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => exportToCSV(filteredContributions, 'contributions.csv')}
                disabled={filteredContributions.length === 0}
              >
                Export CSV
              </button>
            </div>
            {contributionLoading && <Spinner />}
            {contributionError && <ErrorMessage message={contributionError} />}
            {!contributionLoading && !contributionError && (
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Type</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">User</th>
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContributions.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b capitalize">{c.type}</td>
                      <td className="py-2 px-4 border-b capitalize">{c.status}</td>
                      <td className="py-2 px-4 border-b">{c.contributor?.name || '-'}</td>
                      <td className="py-2 px-4 border-b">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">
                        <button className="text-primary-600 hover:underline mr-2" onClick={() => handleViewContribution(c._id)}>View</button>
                        <button className="text-green-600 hover:underline mr-2" onClick={() => handleApproveContribution(c._id)}>Approve</button>
                        <button className="text-red-600 hover:underline" onClick={() => handleRejectContribution(c._id)}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Contribution Details Modal */}
            <Modal isOpen={!!selectedContribution} onClose={() => { setSelectedContribution(null); setContributionDetails(null); setAdjustPointsMode(false); }} width="max-w-lg">
              <h4 className="text-xl font-bold mb-4">Contribution Details</h4>
              {contributionModalLoading ? (
                <Spinner />
              ) : contributionDetails ? (
                <div>
                  <div className="mb-2"><span className="font-semibold">Type:</span> {contributionDetails.type}</div>
                  <div className="mb-2"><span className="font-semibold">Status:</span> {contributionDetails.status}</div>
                  <div className="mb-2"><span className="font-semibold">User:</span> {contributionDetails.contributor?.name || '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Date:</span> {new Date(contributionDetails.createdAt).toLocaleDateString()}</div>
                  <div className="mb-2"><span className="font-semibold">Description:</span> {contributionDetails.description || '-'}</div>
                  {contributionDetails.images && contributionDetails.images.length > 0 && (
                    <div className="mb-2">
                      <span className="font-semibold">Images:</span>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {contributionDetails.images.map((img, i) => (
                          <img key={i} src={img.url || img} alt="contribution" className="h-20 w-20 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                  {contributionDetails.location && contributionDetails.location.coordinates && (
                    <div className="mb-2">
                      <span className="font-semibold">Location:</span> {contributionDetails.location.coordinates.join(', ')}
                    </div>
                  )}
                  {contributionDetails.points !== undefined && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-semibold">Points Awarded:</span> {contributionDetails.points}
                      <button className="text-blue-600 hover:underline ml-2 text-sm" onClick={handleAdjustPoints}>Adjust Points</button>
                    </div>
                  )}
                  {adjustPointsMode && (
                    <form onSubmit={handleSavePoints} className="mt-4 flex gap-2 items-center">
                      <input
                        type="number"
                        value={pointsInput}
                        onChange={e => setPointsInput(e.target.value)}
                        className="border rounded px-2 py-1 w-24"
                        required
                      />
                      <button type="submit" className="bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700">Save</button>
                      <button type="button" className="bg-gray-200 text-gray-700 px-3 py-1 rounded" onClick={() => setAdjustPointsMode(false)}>Cancel</button>
                    </form>
                  )}
                </div>
              ) : (
                <ErrorMessage message="Failed to load contribution details." />
              )}
            </Modal>
          </div>
        )}
        {activeSection === 'reports' && (
          <div>
            <h3 className="text-2xl font-semibold mb-6">Reports & Analytics</h3>
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => stats && exportToCSV([
                  { label: 'Total Users', value: stats.users },
                  { label: 'Total Agents', value: stats.agents },
                  { label: 'Total Listings', value: stats.listings },
                  { label: 'Total Bookings', value: stats.bookings },
                  { label: 'Total Contributions', value: stats.contributions },
                ], 'summary_stats.csv')}
                disabled={!stats}
              >
                Export Summary Stats CSV
              </button>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => usersPerMonth && exportToCSV(usersPerMonth, 'users_per_month.csv')}
                disabled={!usersPerMonth || usersPerMonth.length === 0}
              >
                Export Users Per Month CSV
              </button>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => listingsPerMonth && exportToCSV(listingsPerMonth, 'listings_per_month.csv')}
                disabled={!listingsPerMonth || listingsPerMonth.length === 0}
              >
                Export Listings Per Month CSV
              </button>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                onClick={() => bookingsPerMonth && exportToCSV(bookingsPerMonth, 'bookings_per_month.csv')}
                disabled={!bookingsPerMonth || bookingsPerMonth.length === 0}
              >
                Export Bookings Per Month CSV
              </button>
            </div>
            {statsLoading && <Spinner />}
            {statsError && <ErrorMessage message={statsError} />}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-700">{stats.users}</div>
                  <div className="text-gray-700 mt-2">Total Users</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-700">{stats.agents}</div>
                  <div className="text-gray-700 mt-2">Total Agents</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-700">{stats.listings}</div>
                  <div className="text-gray-700 mt-2">Total Listings</div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-700">{stats.bookings}</div>
                  <div className="text-gray-700 mt-2">Total Bookings</div>
                </div>
                <div className="bg-pink-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-pink-700">{stats.contributions}</div>
                  <div className="text-gray-700 mt-2">Total Contributions</div>
                </div>
              </div>
            )}
            <div className="mb-8">
              <h4 className="text-lg font-bold mb-2">New Users Per Month</h4>
              {usersPerMonthLoading && <Spinner />}
              {usersPerMonthError && <ErrorMessage message={usersPerMonthError} />}
              {usersPerMonth.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <Line
                    data={{
                      labels: usersPerMonth.map(d => d.month),
                      datasets: [
                        {
                          label: 'New Users',
                          data: usersPerMonth.map(d => d.count),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                      },
                    }}
                    height={300}
                  />
                </div>
              )}
            </div>
            <div className="mb-8">
              <h4 className="text-lg font-bold mb-2">New Listings Per Month</h4>
              {listingsPerMonthLoading && <Spinner />}
              {listingsPerMonthError && <ErrorMessage message={listingsPerMonthError} />}
              {listingsPerMonth.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <Line
                    data={{
                      labels: listingsPerMonth.map(d => d.month),
                      datasets: [
                        {
                          label: 'New Listings',
                          data: listingsPerMonth.map(d => d.count),
                          borderColor: 'rgb(16, 185, 129)',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                      },
                    }}
                    height={300}
                  />
                </div>
              )}
            </div>
            <div className="mb-8">
              <h4 className="text-lg font-bold mb-2">New Bookings Per Month</h4>
              {bookingsPerMonthLoading && <Spinner />}
              {bookingsPerMonthError && <ErrorMessage message={bookingsPerMonthError} />}
              {bookingsPerMonth.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <Line
                    data={{
                      labels: bookingsPerMonth.map(d => d.month),
                      datasets: [
                        {
                          label: 'New Bookings',
                          data: bookingsPerMonth.map(d => d.count),
                          borderColor: 'rgb(168, 85, 247)',
                          backgroundColor: 'rgba(168, 85, 247, 0.2)',
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                      },
                    }}
                    height={300}
                  />
                </div>
              )}
            </div>
            {/* Add more analytics/charts here as needed */}
          </div>
        )}
        {/* Other sections (agents, listings, etc.) can be added here */}
      </main>
    </div>
  );
};

export default AdminDashboard; 