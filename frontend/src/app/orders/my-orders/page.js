'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiX,
  FiShoppingBag,
  FiEye,
} from 'react-icons/fi';
import API from '@/utils/axiosConfig';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

const statusIcons = {
  Pending: { icon: FiClock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  Confirmed: { icon: FiCheck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  Processing: { icon: FiPackage, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  Shipped: { icon: FiTruck, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  Delivered: { icon: FiCheck, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  Cancelled: { icon: FiX, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export default function MyOrdersPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/immutability
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      setError('Orders load nahi ho paaye');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { data } = await API.put(`/orders/${orderId}/cancel`, {
        reason: 'Customer requested cancellation',
      });
      
      if (data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === activeTab);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <span className="text-6xl">🔒</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Please Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Orders dekhne ke liye login karna zaroori hai
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 mt-4 bg-primary text-white rounded-full hover:bg-primary/90"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Orders
        </h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {tab === 'all' ? 'All Orders' : tab}
              {tab === 'all' && (
                <span className="ml-1">({orders.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <FiShoppingBag className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet" 
                : `No ${activeTab} orders`}
            </p>
            {activeTab === 'all' && (
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 mt-4 bg-primary text-white rounded-full hover:bg-primary/90"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusIcons[order.orderStatus]?.icon || FiClock;
              const statusStyle = statusIcons[order.orderStatus];
              
              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      {/* Order ID & Date */}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Order ID
                        </p>
                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                          {order.orderId}
                        </p>
                      </div>

                      {/* Status */}
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusStyle?.bg}`}>
                        <StatusIcon className={`text-lg ${statusStyle?.color}`} />
                        <span className={`font-medium text-sm ${statusStyle?.color}`}>
                          {order.orderStatus}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Order Date
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                      {order.orderItems.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden"
                        >
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              👕
                            </div>
                          )}
                        </div>
                      ))}
                      {order.orderItems.length > 4 && (
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            +{order.orderItems.length - 4}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.orderItems.length} items
                        </p>
                        <p className="text-xl font-bold text-primary">
                          ₹{order.totalPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-all">
                          <FiEye className="mr-1" />
                          View Details
                        </span>
                        {['Pending', 'Confirmed'].includes(order.orderStatus) && (
                          <button
                            onClick={(e) => handleCancelOrder(order._id, e)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-all"
                          >
                            <FiX className="mr-1" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}