/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';


export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalProducts: 0,
    outOfStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [orderStats, productStats] = await Promise.all([
        API.get('/orders/admin/stats'),
        API.get('/products/stats'),
      ]);

      if (orderStats.data.success) {
        const os = orderStats.data.stats;
        setStats(prev => ({
          ...prev,
          totalOrders: os.totalOrders,
          todayOrders: os.todayOrders,
          totalRevenue: os.totalRevenue,
          todayRevenue: os.todayRevenue,
        }));
      }

      if (productStats.data.success) {
        const ps = productStats.data.stats;
        setStats(prev => ({
          ...prev,
          totalProducts: ps.totalProducts,
          outOfStock: ps.outOfStock,
        }));
      }

      // Fetch recent orders
      const recentOrdersRes = await API.get('/orders/admin/all?limit=5');
      if (recentOrdersRes.data.success) {
        setRecentOrders(recentOrdersRes.data.orders);
      }
    } catch (error) {
      toast.error('Dashboard data load nahi ho paaya');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      increasing: true,
      icon: FiDollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      change: '+8.2%',
      increasing: true,
      icon: FiShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Today Revenue',
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      change: '+5.1%',
      increasing: true,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      change: `${stats.outOfStock} out of stock`,
      increasing: false,
      icon: FiPackage,
      color: 'bg-orange-500',
    },
  ];

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    Shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here&apos;s what&lsquo;s happening with your store today.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          View Store
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="text-white text-xl" />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                  card.increasing ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {card.increasing ? <FiTrendingUp /> : <FiAlertCircle />}
                  {card.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {card.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {order.orderId}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        {order.shippingAddress?.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {order.shippingAddress?.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {order.orderItems?.length || 0} items
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{order.totalPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.orderStatus] || ''
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}