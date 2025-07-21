import React from 'react';
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      <main className="pt-20">
      <Outlet />
      </main>
      <footer className="text-xs text-gray-400 text-center py-2 mt-8">
        <a href="https://www.flaticon.com/free-icons/pin" title="pin icons" target="_blank" rel="noopener noreferrer">
          Pin icons created by Freepik - Flaticon
        </a>
      </footer>
    </>
  );
}

export default App;
