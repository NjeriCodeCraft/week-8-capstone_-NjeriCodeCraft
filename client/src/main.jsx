import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import AgentRegister from './pages/AgentRegister';
import AgentDashboard from './pages/AgentDashboard';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import MapView from './pages/MapView';
import Contribute from './pages/Contribute';
import ModerationDashboard from './pages/ModerationDashboard';
import Leaderboard from './pages/Leaderboard';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import NotAuthorized from './pages/NotAuthorized';
// Sample AdminDashboard page (replace with your real one)
const AdminDashboard = () => <div className="p-8 text-center">Admin Dashboard (Protected)</div>;
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<App />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Wrap main pages with App layout for Navbar */}
          <Route element={<App />}>
            <Route path="/agent/register" element={<AgentRegister />} />
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/moderation" element={<ModerationDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/not-authorized" element={<NotAuthorized />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
