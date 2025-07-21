import React from 'react';

const ErrorMessage = ({ message, className = '' }) => (
  <div className={`flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 my-2 ${className}`} role="alert" aria-live="assertive">
    <span className="material-icons text-red-500">error_outline</span>
    <span>{message}</span>
  </div>
);

export default ErrorMessage; 