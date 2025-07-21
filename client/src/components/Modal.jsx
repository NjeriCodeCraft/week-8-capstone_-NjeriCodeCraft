import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, className = '', width = 'max-w-md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30 transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* Modal content */}
      <div
        className={`relative bg-white rounded-lg shadow-lg p-8 ${width} w-full mx-4 animate-modalIn ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-modalIn { animation: modalIn 0.2s; }
      `}</style>
    </div>
  );
};

export default Modal; 