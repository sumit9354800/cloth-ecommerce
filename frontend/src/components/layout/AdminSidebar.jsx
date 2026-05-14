'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiHome,
  FiTag,
} from 'react-icons/fi';

const menuItems = [
  {
    section: 'Main',
    items: [
      { name: 'Dashboard', icon: FiGrid, path: '/admin/dashboard' },
      { name: 'Analytics', icon: FiBarChart2, path: '/admin/dashboard/analytics' },
    ],
  },
  {
    section: 'Management',
    items: [
      { name: 'Products', icon: FiPackage, path: '/admin/products' },
      { name: 'Orders', icon: FiShoppingBag, path: '/admin/orders' },
      { name: 'Users', icon: FiUsers, path: '/admin/dashboard/users' },
    ],
  },
  {
    section: 'Other',
    items: [
      { name: 'Categories', icon: FiTag, path: '/admin/dashboard/categories' },
      { name: 'Settings', icon: FiSettings, path: '/admin/dashboard/settings' },
    ],
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${
        collapsed ? 'hidden' : ''
      }`} onClick={() => setCollapsed(true)} />

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-gray-900 dark:bg-black text-white z-50 transition-all duration-300 ${
        collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <FiPackage className="text-white text-lg" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg leading-tight">FashionStore</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-180px)]">
          {menuItems.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {section.section}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.name : ''}
                    >
                      <Icon className="text-lg flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 ${
          collapsed ? 'text-center' : ''
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            )}
          </div>
          
          <Link
            href="/"
            className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${
              collapsed ? 'justify-center' : 'px-2'
            }`}
          >
            <FiHome className="text-lg" />
            {!collapsed && <span className="text-sm">Back to Store</span>}
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;