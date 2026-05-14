'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { FiMenu } from 'react-icons/fi';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Loading from '@/components/common/Loading';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check authentication and admin role
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin/dashboard');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);
    setChecking(false);
  }, [isAuthenticated, user, router]);

  if (checking) {
    return <Loading />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="lg:ml-20 xl:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-30 px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.name}
            </span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}