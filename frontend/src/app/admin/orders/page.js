/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiFilter } from 'react-icons/fi';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';

const statusOptions = ['', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updateLoading, setUpdateLoading] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '50');
      
      const { data } = await API.get(`/orders/admin/all?${params.toString()}`);
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error('Orders load nahi ho paaye');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [orderId]: true }));
      
      const { data } = await API.put(`/orders/admin/${orderId}`, {
        status: newStatus,
      });
      
      if (data.success) {
        toast.success(`Order status "${newStatus}" update ho gaya ✅`);
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      toast.error('Status update nahi ho paaya');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total: {orders.length} orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          {statusOptions.filter(Boolean).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-4 font-medium">Order ID</th>
                <th className="px-4 py-4 font-medium">Customer</th>
                <th className="px-4 py-4 font-medium hidden md:table-cell">Items</th>
                <th className="px-4 py-4 font-medium">Total</th>
                <th className="px-4 py-4 font-medium">Payment</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium hidden lg:table-cell">Date</th>
                <th className="px-4 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4">
                      <Link
                        href={`/orders/${order._id}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {order.orderId}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {order.shippingAddress?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.shippingAddress?.city}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {order.orderItems?.length || 0} items
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white text-sm">
                      ₹{order.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium ${
                        order.paymentInfo?.method === 'COD'
                          ? 'text-orange-500'
                          : 'text-green-500'
                      }`}>
                        {order.paymentInfo?.method || 'COD'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updateLoading[order._id]}
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${
                          statusColors[order.orderStatus] || ''
                        } ${updateLoading[order._id] ? 'opacity-50' : ''}`}
                      >
                        {statusOptions.filter(Boolean).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/orders/${order._id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};