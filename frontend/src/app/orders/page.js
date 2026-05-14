'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import API from '@/utils/axiosConfig';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/admin/all?limit=50');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error('Orders load nahi ho paaye');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/admin/${orderId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus} ✅`);
      fetchOrders();
    } catch (error) {
      toast.error('Status update nahi ho paaya');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-4 font-medium">Order ID</th>
                <th className="px-4 py-4 font-medium">Customer</th>
                <th className="px-4 py-4 font-medium">Total</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm text-primary">
                        {order.orderId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {order.shippingAddress?.fullName}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white text-sm">
                      ₹{order.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${
                          statusColors[order.orderStatus] || ''
                        }`}
                      >
                        {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
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
}