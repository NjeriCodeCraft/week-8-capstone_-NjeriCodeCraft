import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/notifications?read=false&channel=in-app`);
        setNotifications(res.data.notifications || []);
        setUnreadCount((res.data.notifications || []).filter(n => !n.read).length);
      } catch {}
    };
    fetchNotifications();
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/users/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(unreadCount - 1);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-heading">RentRadar</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/app" className="text-white hover:text-accent-500 px-4 py-2 rounded transition">
              Search
            </Link>
            <Link to="/map" className="text-white hover:text-accent-500 px-4 py-2 rounded transition">
              Map
            </Link>
            <Link to="/contribute" className="text-white hover:text-accent-500 px-4 py-2 rounded transition">
              Contribute
            </Link>
            <Link to="/leaderboard" className="text-white hover:text-accent-500 px-4 py-2 rounded transition">
              Leaderboard
            </Link>
            {/* Notification bell */}
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="relative focus:outline-none text-white hover:text-accent-500 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  onClick={() => setShowDropdown((v) => !v)}
                  aria-label="Notifications"
                >
                  <span className="material-icons text-base">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2 border-b font-semibold text-blue">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm">No new notifications.</div>
                    ) : notifications.map((n) => (
                      <div key={n._id} className={`flex items-start gap-2 px-4 py-3 border-b hover:bg-background ${n.read ? 'opacity-60' : ''}`}>
                        <span className="material-icons text-lg mt-0.5 text-accent-500">{n.type === 'listing' ? 'home' : n.type === 'contribution' ? 'volunteer_activism' : 'info'}</span>
                        <div className="flex-1">
                          <div className="text-sm text-heading">{n.message}</div>
                          {n.link && (
                            <Link to={n.link} className="text-xs text-blue hover:text-accent-500 hover:underline">View</Link>
                          )}
                          <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                        {!n.read && (
                          <button
                            className="ml-2 text-xs text-blue hover:text-accent-500 hover:underline"
                            onClick={() => handleMarkAsRead(n._id)}
                          >Mark as read</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Moderation link for admin/agent only */}
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'agent') && (
              <Link to="/moderation" className="text-white hover:text-accent-500 px-3 py-2 rounded-md text-sm font-medium">
                Moderation
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="bg-accent-500 text-white hover:bg-blue px-4 py-2 rounded transition">
                  Login
                </Link>
                <Link to="/register" className="bg-accent-500 text-white hover:bg-blue px-4 py-2 rounded transition">
                  Register
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link to="/profile" className="text-white hover:text-accent-500 px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
                {user?.role !== 'agent' && (
                  <Link to="/my-bookings" className="text-white hover:text-accent-500 px-3 py-2 rounded-md text-sm font-medium">
                    My Bookings
                  </Link>
                )}
                {user?.role === 'agent' && (
                  <Link to="/agent/dashboard" className="text-white hover:text-accent-500 px-3 py-2 rounded-md text-sm font-medium">
                    Agent Dashboard
                  </Link>
                )}
                {user?.role !== 'agent' && (
                  <Link to="/agent/register" className="text-white hover:text-accent-500 px-3 py-2 rounded-md text-sm font-medium">
                    Become an Agent
                  </Link>
                )}
                <span className="text-white font-semibold px-3 py-2 text-sm">Hi, {user?.name?.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="bg-accent-500 text-white hover:bg-blue px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 