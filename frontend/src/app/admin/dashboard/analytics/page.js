'use client';

import { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
} from 'react-icons/fi';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [orderStats, productStats] = await Promise.all([
        API.get('/orders/admin/stats'),
        API.get('/products/stats'),
      ]);

      if (orderStats.data.success && productStats.data.success) {
        setStats({
          orders: orderStats.data.stats,
          products: productStats.data.stats,
        });
      }
    } catch (error) {
      toast.error('Analytics data load nahi ho paaya');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Detailed insights about your store
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <FiDollarSign className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{stats?.orders?.totalRevenue?.toLocaleString() || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FiShoppingBag className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.orders?.totalOrders || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{stats?.orders?.todayRevenue?.toLocaleString() || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Today Revenue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <FiPackage className="text-white text-xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.products?.totalProducts || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Order Status Distribution
        </h2>
        <div className="space-y-4">
          {stats?.orders?.ordersByStatus?.length > 0 ? (
            stats.orders.ordersByStatus.map((status) => {
              const total = stats.orders.totalOrders;
              const percentage = total > 0 ? ((status.count / total) * 100).toFixed(1) : 0;
              
              const colorMap = {
                Pending: 'bg-yellow-500',
                Confirmed: 'bg-blue-500',
                Processing: 'bg-purple-500',
                Shipped: 'bg-indigo-500',
                Delivered: 'bg-green-500',
                Cancelled: 'bg-red-500',
              };

              return (
                <div key={status._id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {status._id}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {status.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${colorMap[status._id] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No order data available
            </p>
          )}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Products by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats?.products?.categoryStats?.map((cat) => (
            <div
              key={cat._id}
              className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
            >
              <p className="text-2xl font-bold text-primary">{cat.count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{cat._id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}