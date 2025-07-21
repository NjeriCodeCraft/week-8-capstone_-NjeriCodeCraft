import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Smart Search',
    desc: 'Find rentals by location, budget, and amenities in seconds.',
    icon: '🔍',
  },
  {
    title: 'Verified Listings',
    desc: 'No more scams. All listings and agents are verified for your safety.',
    icon: '✅',
  },
  {
    title: 'Map & Directions',
    desc: 'See exactly where each house is and get directions from your location.',
    icon: '🗺️',
  },
  {
    title: 'Local Guides',
    desc: 'Book a trusted local to view a house for you, even if you’re far away.',
    icon: '🤝',
  },
  {
    title: 'M-PESA Payments',
    desc: 'Pay securely for premium services with M-PESA or card.',
    icon: '💸',
  },
  {
    title: 'Save Favorites',
    desc: 'Bookmark listings and get alerts when new houses match your criteria.',
    icon: '⭐',
  },
];

const testimonials = [
  {
    name: 'Grace W.',
    text: 'I found my apartment in Juja in just 2 days! No more endless WhatsApp groups.',
  },
  {
    name: 'Brian K.',
    text: 'The local guide service is a game changer. I booked a viewing while still upcountry.',
  },
  {
    name: 'Janet M.',
    text: 'I love the verified listings. I feel much safer using RentRadar.',
  },
];

const LandingPage = () => (
  <div className="min-h-screen bg-[#F5F8FA] text-[#2D2D2D] flex flex-col items-center justify-center font-sans" style={{ fontFamily: 'Inter, Poppins, Rubik, sans-serif' }}>
    {/* Hero Section - modern UI */}
    <div className="w-full flex justify-center py-20 px-4">
      <div className="max-w-3xl w-full text-center bg-white rounded-lg shadow-md p-12" style={{ borderRadius: '8px' }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#2D2D2D' }}>
          Welcome to RentRadar
        </h1>
        <p className="text-[#5F6C7B] text-lg md:text-xl mb-8" style={{ fontSize: '18px' }}>
          Discover affordable, verified houses and apartments. Search by location, budget, and amenities. Book local guides. All in one place.
        </p>
        <Link to="/register">
          <button className="bg-[#FF6B6B] hover:bg-[#FF4D4D] text-white px-10 py-4 mt-4 text-lg font-semibold rounded-md shadow-md transition-all duration-300" style={{ borderRadius: '8px' }}>
            Get Started
          </button>
        </Link>
      </div>
    </div>

    {/* Features Grid */}
    <div className="max-w-5xl mx-auto py-16 px-4">
      <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#1A73E8' }}>Why Choose RentRadar?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={f.title} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center" style={{ borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
            <div className="text-4xl mb-3" style={{ color: i === 1 ? '#00C897' : i === 2 ? '#1A73E8' : i === 3 ? '#FFD166' : i === 4 ? '#FF6B6B' : '#5F6C7B' }}>{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#1A73E8' }}>{f.title}</h3>
            <p className="text-[#5F6C7B]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Testimonials */}
    <div className="bg-white py-12 px-4 w-full">
      <h2 className="text-xl font-bold text-center mb-8" style={{ color: '#1A73E8' }}>What Our Users Say</h2>
      <div className="max-w-3xl mx-auto grid gap-8 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <div key={t.name} className="bg-[#F5F8FA] rounded-xl shadow p-6 flex flex-col items-center" style={{ borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
            <div className="text-3xl mb-2" style={{ color: '#FF6B6B' }}>“</div>
            <p className="text-[#5F6C7B] mb-4">{t.text}</p>
            <div className="font-semibold" style={{ color: '#1A73E8' }}>{t.name}</div>
          </div>
        ))}
      </div>
    </div>

    {/* CTA Footer - full width sky blue */}
    <div className="w-full bg-[#1A73E8] text-center py-12 mt-auto">
      <h3 className="text-2xl font-bold mb-2 text-white">Ready to find your next home?</h3>
      <Link to="/register">
        <button className="bg-[#FF6B6B] hover:bg-[#FF4D4D] text-white font-bold px-8 py-3 rounded-lg shadow-md transition-all duration-300" style={{ borderRadius: '8px' }}>
          Get Started
        </button>
      </Link>
    </div>
  </div>
);

export default LandingPage; 