'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error('Order ID likhna zaroori hai');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.get(`/orders/track/${orderId.trim()}`);
      
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      toast.error('Order nahi mila. Sahi Order ID likho.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Track Your Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your Order ID to check the status
            </p>
          </div>

          <form onSubmit={handleTrack} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., ORD-20240113-ABC12"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FiSearch />
                )}
              </button>
            </div>
          </form>

          {order && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="text-gray-900 dark:text-white">{order.items} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-bold text-primary">₹{order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(order.orderDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                {order.deliveredDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered Date</span>
                    <span className="text-green-500">
                      {new Date(order.deliveredDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}