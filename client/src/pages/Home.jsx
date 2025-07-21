import React, { useState, useRef, useEffect, useCallback } from 'react';
import SearchForm from '../components/SearchForm';
import ListingCard from '../components/ListingCard';
import { getListings } from '../services/listings';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { toast } from 'react-toastify';

const PAGE_SIZE = 6;

const Home = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastFilters, setLastFilters] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const containerRef = useRef(null);

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    setSearched(false);
    setPage(1);
    setLastFilters(filters);
    try {
      const listingsData = await getListings({ ...filters, page: 1, limit: PAGE_SIZE });
      setResults(listingsData.listings || listingsData);
      setTotalPages(listingsData.pagination?.total || 1);
    } catch (err) {
      setError('Failed to fetch listings.');
      toast.error('Failed to fetch listings.');
      setResults([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const listingsData = await getListings({ ...lastFilters, page: nextPage, limit: PAGE_SIZE });
      setResults((prev) => [...prev, ...(listingsData.listings || listingsData)]);
      setPage(nextPage);
      setTotalPages(listingsData.pagination?.total || 1);
    } catch (err) {
      setError('Failed to fetch more listings.');
      toast.error('Failed to fetch more listings.');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, totalPages, lastFilters]);

  useEffect(() => {
    if (!searched || page >= totalPages) return;
    const handleScroll = () => {
      const container = containerRef.current || window;
      const scrollY = container === window ? window.scrollY : container.scrollTop;
      const height = container === window ? document.documentElement.scrollHeight : container.scrollHeight;
      const clientHeight = container === window ? window.innerHeight : container.clientHeight;
      if (height - (scrollY + clientHeight) < 200) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searched, page, totalPages, loadMore]);

  if (authLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#2D2D2D] flex flex-col items-center justify-center font-sans" style={{ fontFamily: 'Inter, Poppins, Rubik, sans-serif' }}>
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-center" style={{ color: '#1A73E8' }}>Find Your Next Home</h1>
        <SearchForm onSearch={handleSearch} />
        {loading && <Spinner />}
        {error && <ErrorMessage message={error} />}
        {searched && !loading && !error && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A73E8' }}>Search Results</h2>
            {results.length === 0 ? (
              <div className="text-[#5F6C7B]">No listings found. Try different filters.</div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {results.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
                {loadingMore && <Spinner />}
                {page >= totalPages && results.length > 0 && (
                  <div className="text-center py-4 text-[#5F6C7B]">End of results.</div>
                )}
              </>
            )}
          </div>
        )}
        {!isAuthenticated && (
          <button
            className="bg-accent-500 text-white px-8 py-3 mt-6 w-full rounded hover:bg-blue transition"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  );
};

export default Home; 