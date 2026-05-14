/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiHeart,
  FiShoppingBag,
  FiArrowLeft,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { updateQuantity, removeFromCart, clearCart } from '@/redux/slices/cartSlice';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, totalQuantity, totalPrice } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync cart with backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/immutability
      syncCartWithBackend();
    }
  }, [isAuthenticated]);

  const syncCartWithBackend = async () => {
    try {
      // Get cart from backend
      const { data } = await API.get('/cart');
      if (data.success && data.cart) {
        // Update Redux store with backend cart
        data.cart.items.forEach(item => {
          dispatch({
            type: 'cart/setCartFromBackend',
            payload: data.cart,
          });
        });
      }
    } catch (error) {
      console.error('Cart sync failed:', error);
    }
  };

  const handleQuantityChange = async (productId, newQuantity, size, color) => {
    if (newQuantity < 1) return;
    
    dispatch(updateQuantity({ productId, quantity: newQuantity, size, color }));
    
    if (isAuthenticated) {
      try {
        await API.put('/cart/update', {
          productId,
          quantity: newQuantity,
          size,
          color,
        });
      } catch (error) {
        toast.error('Quantity update nahi ho paayi');
      }
    }
  };

  const handleRemoveItem = async (productId, size, color) => {
    dispatch(removeFromCart({ productId, size, color }));
    toast.success('Item cart se remove ho gaya');
    
    if (isAuthenticated) {
      try {
        await API.delete(`/cart/remove/${productId}?size=${size}&color=${color}`);
      } catch (error) {
        console.error('Backend se remove nahi hua:', error);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Poora cart clear karna hai?')) {
      dispatch(clearCart());
      toast.success('Cart clear ho gaya');
      
      if (isAuthenticated) {
        try {
          await API.delete('/cart/clear');
        } catch (error) {
          console.error('Backend cart clear nahi hua:', error);
        }
      }
    }
  };

  const handleApplyCoupon = () => {
    // Example coupon codes
    const coupons = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FASHION50': 50,
      'FLAT500': 500,
    };

    if (coupons[couponCode.toUpperCase()]) {
      const discountValue = coupons[couponCode.toUpperCase()];
      if (discountValue <= 100) {
        // Percentage discount
        setDiscount(Math.floor(totalPrice * discountValue / 100));
      } else {
        // Fixed discount
        setDiscount(discountValue);
      }
      toast.success(`Coupon applied! ₹${discountValue} discount 🎉`);
    } else {
      toast.error('Invalid coupon code');
    }
    setCouponCode('');
  };

  const deliveryCharges = totalPrice > 999 ? 0 : 99;
  const finalPrice = totalPrice - discount + deliveryCharges;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <span className="text-8xl">🛒</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added anything to your cart yet. 
              Explore our products and find something you love!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transform hover:scale-105 transition-all"
            >
              <FiShoppingBag className="mr-2" />
              Continue Shopping
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
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {totalQuantity} items in your cart
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center text-primary hover:underline"
          >
            <FiArrowLeft className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item._id}-${item.selectedSize}-${item.selectedColor}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item._id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {item.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.images[0].url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">👕</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link
                            href={`/products/${item._id}`}
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.category}
                          </p>
                          
                          {/* Size & Color */}
                          <div className="flex gap-3 mt-2">
                            {item.selectedSize && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                                Color: {item.selectedColor}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            ₹{item.price * item.quantity}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-500">
                              ₹{item.price} each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(
                              item._id,
                              item.quantity - 1,
                              item.selectedSize,
                              item.selectedColor
                            )}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                          >
                            <FiMinus className="text-gray-600 dark:text-gray-300" />
                          </button>
                          <span className="px-4 py-2 text-gray-900 dark:text-white font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(
                              item._id,
                              item.quantity + 1,
                              item.selectedSize,
                              item.selectedColor
                            )}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <FiPlus className="text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Move to wishlist logic
                              toast.success('Moved to wishlist! ❤️');
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Move to Wishlist"
                          >
                            <FiHeart />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(
                              item._id,
                              item.selectedSize,
                              item.selectedColor
                            )}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Item"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={handleClearCart}
              className="w-full py-3 border-2 border-red-200 dark:border-red-900 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Apply
                  </button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['WELCOME10', 'SAVE20', 'FLAT500'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setCouponCode(code)}
                      className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-primary hover:text-white transition-all"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} items)</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharges === 0 ? 'text-green-500' : ''}>
                    {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
                  </span>
                </div>
                
                {deliveryCharges > 0 && (
                  <p className="text-xs text-primary">
                    Add ₹{999 - totalPrice} more for free delivery
                  </p>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{finalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Including all taxes
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href={isAuthenticated ? '/checkout' : '/auth/login'}
                className="block w-full py-4 bg-primary text-white text-center font-semibold rounded-xl hover:bg-primary/90 transform hover:scale-[1.02] transition-all mt-6"
              >
                Proceed to Checkout
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiShield className="text-green-500" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiTruck className="text-blue-500" />
                  <span>Free Delivery above ₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}