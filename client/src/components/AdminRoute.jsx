import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || user.role !== 'admin') return <Navigate to="/not-authorized" replace />;
  return children;
};

export default AdminRoute; 