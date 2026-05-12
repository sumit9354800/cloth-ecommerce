'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { addToCart } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    setIsWishlisted(!isWishlisted);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      icon: isWishlisted ? '💔' : '❤️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product._id}?view=quick`);
  };

  // Discount calculate karo (example ke liye)
  // eslint-disable-next-line react-hooks/purity
  const discount = Math.floor(Math.random() * 30) + 10; // 10-40% discount
  const originalPrice = (product.price * (100 + discount) / 100).toFixed(2);

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/products/${product._id}`)}
    >
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-20">
        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          -{discount}% OFF
        </span>
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-20 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition-transform"
      >
        <FiHeart
          className={`text-lg transition-colors ${
            isWishlisted ? 'fill-current text-red-500' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
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
        
        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleAddToCart}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:scale-110"
            title="Add to Cart"
          >
            <FiShoppingCart className="text-lg" />
          </button>
          <button
            onClick={handleQuickView}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:scale-110"
            title="Quick View"
          >
            <FiEye className="text-lg" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary uppercase">
            {product.category}
          </span>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
              {product.ratings || '4.5'}
            </span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              ₹{product.price}
            </span>
            <span className="text-sm text-gray-400 line-through ml-2">
              ₹{originalPrice}
            </span>
          </div>
          <span className={`text-xs ${
            product.stock > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Available Colors (if any) */}
        {product.color && product.color.length > 0 && (
          <div className="flex gap-1 mt-2">
            {product.color.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {product.color.length > 4 && (
              <span className="text-xs text-gray-500">
                +{product.color.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add to Cart Button - Mobile */}
      <button
        onClick={handleAddToCart}
        className="w-full py-3 bg-primary text-white font-semibold opacity-0 md:hidden group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/90"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;