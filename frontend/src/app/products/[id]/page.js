/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // ✅ Added useRouter
import { useDispatch } from 'react-redux';
import { FiShoppingCart, FiHeart, FiShare2, FiMinus, FiPlus, FiStar, FiTruck } from 'react-icons/fi';
import { addToCart } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import ProductCard from '@/components/products/ProductCard';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';
import Loading from '@/components/common/Loading';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter(); // ✅ Added router
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data } = await API.get(`/products/${id}`);
        
        if (data.success) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts);
          if (data.product.size?.length > 0) {
            setSelectedSize(data.product.size[0]);
          }
          if (data.product.color?.length > 0) {
            setSelectedColor(data.product.color[0]);
          }
        }
      } catch (error) {
        setError('Product details load nahi ho paaye');
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize && product.size?.length > 0) {
      toast.error('Please select a size');
      return;
    }
    
    dispatch(addToCart({
      ...product,
      quantity,
      selectedSize,
      selectedColor,
    }));
    
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout'); // ✅ Now router is defined
  };

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">😔 {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/" className="hover:text-primary">Home</Link></li>
            <li><span>/</span></li>
            <li><Link href="/products" className="hover:text-primary">Products</Link></li>
            <li><span>/</span></li>
            <li><Link href={`/products?category=${product.category}`} className="hover:text-primary">{product.category}</Link></li>
            <li><span>/</span></li>
            <li className="text-primary">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Left - Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                {product.images?.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl">👕</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div className="space-y-6">
              {/* Category & Name */}
              <div>
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`${
                        star <= Math.floor(product.ratings)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.ratings}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ({product.numOfReviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ₹{Math.floor(product.price * 1.5)}
                </span>
                <span className="text-green-500 font-semibold">50% OFF</span>
              </div>

              {/* Size Selection */}
              {product.size?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Size: <span className="text-primary">{selectedSize}</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.color?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Color: <span className="text-primary">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.color.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-primary scale-110'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Quantity
                </h3>
                <div className="inline-flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="px-6 py-3 text-lg font-semibold text-gray-900 dark:text-white border-x-2 border-gray-300 dark:border-gray-600">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <FiPlus />
                  </button>
                </div>
                <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  {product.stock} items available
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="text-xl" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transform hover:scale-[1.02] transition-all"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => {
                    dispatch(toggleWishlist(product));
                    toast.success('Added to wishlist! ❤️');
                  }}
                  className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:text-primary transition-all"
                >
                  <FiHeart className="text-xl" />
                </button>
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: product.name,
                      url: window.location.href,
                    }).catch(() => {/* fallback */});
                  }}
                  className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:text-primary transition-all"
                >
                  <FiShare2 className="text-xl" />
                </button>
              </div>

              {/* Shipping Info */}
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <FiTruck className="text-xl" />
                <span className="text-sm font-medium">Free Shipping on orders above ₹999</span>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {['description', 'reviews', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Reviews coming soon...
                  </p>
                </div>
              )}
              
              {activeTab === 'shipping' && (
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>🚚 Free shipping on orders above ₹999</p>
                  <p>📦 Standard delivery: 3-5 business days</p>
                  <p>⚡ Express delivery: 1-2 business days</p>
                  <p>🔄 Easy 7-day returns policy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}