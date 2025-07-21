import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/leaderboard`);
        setLeaders(res.data.leaderboard || []);
      } catch (err) {
        setError('Failed to load leaderboard.');
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">Top Contributors</h2>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">#</th>
                <th className="p-2">Name</th>
                <th className="p-2">Points</th>
                <th className="p-2">Total</th>
                <th className="p-2">Approved</th>
                <th className="p-2">Pending</th>
                <th className="p-2">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {leaders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No contributors yet.</td></tr>
              ) : leaders.map((u, i) => (
                <tr key={u.name} className="border-b">
                  <td className="p-2 font-bold text-lg text-primary-700">{i + 1}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2 font-semibold text-blue-700">{u.points}</td>
                  <td className="p-2">{u.total}</td>
                  <td className="p-2 text-green-700">{u.approved}</td>
                  <td className="p-2 text-yellow-700">{u.pending}</td>
                  <td className="p-2 text-red-700">{u.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 