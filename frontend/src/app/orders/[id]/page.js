/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiX,
  FiMapPin,
  FiPhone,
  FiCreditCard,
} from 'react-icons/fi';
import API from '@/utils/axiosConfig';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

const statusSteps = [
  { status: 'Pending', label: 'Order Placed', icon: FiClock },
  { status: 'Confirmed', label: 'Confirmed', icon: FiCheck },
  { status: 'Processing', label: 'Processing', icon: FiPackage },
  { status: 'Shipped', label: 'Shipped', icon: FiTruck },
  { status: 'Delivered', label: 'Delivered', icon: FiCheck },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderDetails();
    } else {
      router.push('/auth/login');
    }
  }, [id, isAuthenticated]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      toast.error('Order details load nahi ho paaye');
      router.push('/orders/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { data } = await API.put(`/orders/${id}/cancel`, {
        reason: 'Customer requested cancellation',
      });
      
      if (data.success) {
        toast.success('Order cancelled successfully');
        setOrder(data.order);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <Loading />;
  if (!order) return null;

  const currentStepIndex = statusSteps.findIndex(step => step.status === order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order {order.orderId}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  order.orderStatus === 'Cancelled'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                    : order.orderStatus === 'Delivered'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                }`}>
                  {order.orderStatus}
                </div>
              </div>

              {/* Order Progress Tracker */}
              {order.orderStatus !== 'Cancelled' && (
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isLast = index === statusSteps.length - 1;
                      
                      return (
                        <div key={step.status} className="flex-1 flex flex-col items-center relative">
                          {/* Connector Line */}
                          {!isLast && (
                            <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                              index < currentStepIndex
                                ? 'bg-primary'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                          )}
                          
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          }`}>
                            <StepIcon className="text-sm" />
                          </div>
                          <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium text-center">
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {order.orderStatus === 'Cancelled' && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Order Cancelled
                  </p>
                  <p className="text-sm text-red-500 mt-1">
                    Reason: {order.cancellationReason}
                  </p>
                  {order.cancelledAt && (
                    <p className="text-xs text-red-400 mt-1">
                      Cancelled on: {new Date(order.cancelledAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiPackage />
                Order Items ({order.orderItems.length})
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">👕</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.size && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiMapPin />
                Shipping Address
              </h2>
              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                {order.shippingAddress.landmark && (
                  <p>Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="flex items-center gap-1 mt-2">
                  <FiPhone className="text-sm" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-4">
            {/* Price Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiCreditCard />
                Price Summary
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Items Total</span>
                  <span>₹{order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST (5%)</span>
                  <span>₹{order.taxPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={order.shippingPrice === 0 ? 'text-green-500' : ''}>
                    {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-3">
                  <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.paymentInfo?.method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                  {order.paymentInfo?.paidAt && (
                    <p className="text-xs text-green-500 mt-1">
                      Paid on: {new Date(order.paymentInfo.paidAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div className="pt-3">
                    <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                    <p className="font-mono font-semibold text-primary">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              {['Pending', 'Confirmed'].includes(order.orderStatus) && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full mt-6 py-3 border-2 border-red-200 dark:border-red-900 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
                >
                  Cancel Order
                </button>
              )}

              {/* Delivered Message */}
              {order.orderStatus === 'Delivered' && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                  <FiCheck className="text-2xl text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
