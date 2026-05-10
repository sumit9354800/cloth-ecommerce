'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { FiGrid, FiList, FiSliders, FiX } from 'react-icons/fi';
import ProductCard from '@/components/products/ProductCard';
import ProductFilter from '@/components/products/ProductFilter';
import { setProducts, setFilters } from '@/redux/slices/productSlice';
import API from '@/utils/axiosConfig';
import Loading from '@/components/common/Loading';

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [sortBy, setSortBy] = useState('newest');
  
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { products, filters } = useSelector((state) => state.products);

  // URL se search query aur category lo
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  // Products fetch karo
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Query parameters build karo
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      params.append('sort', sortBy);
      
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);

      const { data } = await API.get(`/products?${params.toString()}`);
      
      if (data.success) {
        dispatch(setProducts(data.products));
        dispatch(setFilters(data.filters));
        setPagination(data.pagination);
      }
    } catch (error) {
      setError('Products load nahi ho paaye. Please try again.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load aur filter change par products fetch karo
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts(pagination.currentPage);
  }, [searchQuery, categoryFilter, sortBy]);

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">😔 {error}</p>
          <button
            onClick={() => fetchProducts(1)}
            className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          {searchQuery && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Search Results for: &quot;{searchQuery}&quot;
            </h1>
          )}
          {categoryFilter && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {categoryFilter}
            </h1>
          )}
          {!searchQuery && !categoryFilter && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              All Products
            </h1>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            {pagination.totalProducts || 0} products found
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          {/* Left side - Filter toggle aur sort */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <FiSliders className="mr-2" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {/* Right side - View toggle aur results count */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {products.length} products showing
            </span>
            
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'} md:block md:static md:bg-transparent`}>
            <div className={`w-72 bg-white dark:bg-gray-800 h-full md:h-auto overflow-y-auto shadow-xl md:shadow-none rounded-r-xl md:rounded-none p-4 ${
              showFilters ? 'relative z-50' : ''
            }`}>
              {/* Close button for mobile */}
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden mb-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FiX className="text-xl text-gray-600 dark:text-gray-200" />
              </button>
              
              <ProductFilter filters={filters} />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <Loading />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl">🔍</span>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
                  No Products Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Try different filters or search terms
                </p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-6'
                }>
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      
                      {[...Array(pagination.totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            pagination.currentPage === index + 1
                              ? 'bg-primary text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}