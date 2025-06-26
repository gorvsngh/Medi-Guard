'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-2xl">🛡️</span>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">MedGuard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">👋</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Welcome to MedGuard
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.name}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📋</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Medical Profile
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.bloodType ? `Blood Type: ${user.bloodType}` : 'Incomplete'}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href="/profile"
                    className="text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    {user.bloodType ? 'Update Profile' : 'Complete Profile'} →
                  </Link>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📱</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Emergency QR Code
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Generate Code
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href="/qr-code"
                    className="text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    View QR Code →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    📝 Update Medical Info
                  </Link>
                  <Link
                    href="/emergency-contacts"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    👥 Emergency Contacts
                  </Link>
                  <Link
                    href="/settings"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    ⚙️ Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Account Information
                </h3>
                <div className="mt-5 border-t border-gray-200">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.name}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Email address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.email}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Public Token
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.publicToken || 'Not generated'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 