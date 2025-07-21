import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <div className="bg-white rounded-lg shadow p-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h2>
      <p className="mb-6 text-gray-700">You do not have permission to view this page.</p>
      <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded shadow">
        Go to Home
      </Link>
    </div>
  </div>
);

export default NotAuthorized; 