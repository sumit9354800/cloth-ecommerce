/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { FiShoppingCart, FiTrash2, FiHeart } from 'react-icons/fi';
import { removeFromWishlist, clearWishlist } from '@/redux/slices/wishlistSlice';
import { addToCart } from '@/redux/slices/cartSlice';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistFromBackend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchWishlistFromBackend = async () => {
    try {
      const { data } = await API.get('/wishlist');
      if (data.success) {
        // Update Redux store
        dispatch({ type: 'wishlist/setWishlistFromBackend', payload: data.wishlist });
      }
    } catch (error) {
      console.error('Wishlist fetch failed:', error);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Removed from wishlist');
    
    if (isAuthenticated) {
      try {
        await API.delete(`/wishlist/remove/${productId}`);
      } catch (error) {
        console.error('Backend remove failed:', error);
      }
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleMoveAllToCart = () => {
    items.forEach(product => {
      dispatch(addToCart(product));
    });
    dispatch(clearWishlist());
    toast.success('All items moved to cart! 🎉');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <span className="text-8xl">💝</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Save your favorite items here and come back to them anytime!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transform hover:scale-105 transition-all"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Wishlist
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {items.length} items saved
            </p>
          </div>
          <button
            onClick={handleMoveAllToCart}
            className="hidden sm:inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all"
          >
            <FiShoppingCart className="mr-2" />
            Move All to Cart
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* Product Image */}
              <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden">
                {product.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <span className="text-6xl">👕</span>
                  </div>
                )}
                
                {/* Stock Status */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {product.stock > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="p-3 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                      title="Add to Cart"
                    >
                      <FiShoppingCart className="text-lg" />
                    </button>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {product.category}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-bold text-primary">
                    ₹{product.price}
                  </span>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from Wishlist"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {/* Add to Cart Button - Mobile */}
                {product.stock > 0 && (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors sm:hidden"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Move All Button */}
        <button
          onClick={handleMoveAllToCart}
          className="sm:hidden fixed bottom-6 left-4 right-4 py-4 bg-primary text-white font-semibold rounded-full shadow-lg hover:bg-primary/90 transition-all z-40"
        >
          Move All to Cart
        </button>
      </div>
    </div>
  );
}