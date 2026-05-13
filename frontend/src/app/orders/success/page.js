'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiPackage, FiTruck, FiClock, FiArrowRight } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect after 10 seconds
  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/orders/my-orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <FiCheckCircle className="text-5xl text-green-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order ID Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Order ID</p>
            <p className="text-2xl font-bold text-primary mb-6 font-mono">{orderId}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <FiClock className="text-2xl text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Order Status</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Confirmed</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <FiPackage className="text-2xl text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Processing</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Within 24hrs</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <FiTruck className="text-2xl text-green-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Delivery</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">3-5 Days</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/orders/my-orders`}
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all"
            >
              View My Orders
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-full hover:border-primary hover:text-primary transition-all"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Auto-redirect Notice */}
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            Auto-redirecting to orders in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}