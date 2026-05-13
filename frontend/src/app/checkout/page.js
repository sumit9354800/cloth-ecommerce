'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiTruck, FiCreditCard } from 'react-icons/fi';
import { clearCart } from '@/redux/slices/cartSlice';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Payment
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const [orderNotes, setOrderNotes] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Checkout ke liye login karna zaroori hai');
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading) {
      toast.error('Cart mein koi items nahi hai');
      router.push('/products');
    }
  }, [items]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    if (!address.fullName.trim()) {
      toast.error('Full name likhna zaroori hai');
      return false;
    }
    if (!address.phone.match(/^[6-9]\d{9}$/)) {
      toast.error('Sahi 10-digit mobile number likho');
      return false;
    }
    if (!address.address.trim()) {
      toast.error('Address likhna zaroori hai');
      return false;
    }
    if (!address.city.trim()) {
      toast.error('City likhna zaroori hai');
      return false;
    }
    if (!address.state.trim()) {
      toast.error('State likhna zaroori hai');
      return false;
    }
    if (!address.pincode.match(/^\d{6}$/)) {
      toast.error('Sahi 6-digit pincode likho');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    // Agar COD hai toh directly order place karo
    if (paymentMethod === 'COD') {
      try {
        setLoading(true);

        const orderData = {
          orderItems: items.map(item => ({
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.selectedSize,
            color: item.selectedColor,
          })),
          shippingAddress: address,
          paymentMethod: 'COD',
          orderNotes,
        };

        const { data } = await API.post('/orders', orderData);

        if (data.success) {
          dispatch(clearCart());
          toast.success('Order place ho gaya! 🎉');
          router.push(`/orders/success?orderId=${data.order.orderId}`);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Order place nahi ho paaya');
      } finally {
        setLoading(false);
      }
    }
    // Online payment ke liye Razorpay (baad mein add karenge)
  };

  // Price calculations
  const itemsPrice = totalPrice;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const finalTotal = itemsPrice + taxPrice + shippingPrice;

  // Redirect if not authenticated
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Form - Left */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center mb-8">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step >= stepNum
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {step > stepNum ? <FiCheck /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > stepNum ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiTruck className="text-primary" />
                Shipping Address
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                    placeholder="6-digit pincode"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={address.address}
                    onChange={handleAddressChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
                    placeholder="House no, street, area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <select
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select State</option>
                    {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Punjab'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={address.landmark}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiCreditCard className="text-primary" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <div className="ml-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Cash on Delivery (COD)
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pay when you receive the order
                    </p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    disabled
                    className="text-primary focus:ring-primary"
                  />
                  <div className="ml-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Online Payment (Coming Soon)
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      UPI, Cards, NetBanking
                    </p>
                  </div>
                </label>
              </div>

              {/* Order Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Any special instructions for delivery"
                />
              </div>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                      {item.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">👕</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                        {item.selectedSize && ` | Size: ${item.selectedSize}`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{taxPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green-500' : ''}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                {itemsPrice < 999 && (
                  <p className="text-xs text-primary">
                    Add ₹{999 - itemsPrice} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transform hover:scale-[1.02] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  `Place Order • ₹${finalTotal}`
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}