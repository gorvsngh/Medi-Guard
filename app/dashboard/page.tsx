'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AlertButton from '@/components/AlertButton';
import ContactsModal from '@/components/ContactsModal';
import Link from 'next/link';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  bloodType?: string;
  publicToken?: string;
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
}

export default function DashboardPage() {
  const { user: authUser, loading, logout, refreshUser } = useAuth();
  const user = authUser as ExtendedUser | null;
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      window.location.href = '/login';
    }
  }, [user, loading, isLoggingOut]);

  // Refresh user data when component mounts to get latest emergency contacts
  useEffect(() => {
    if (!loading && user) {
      refreshUser();
    }
  }, [loading, user, refreshUser]);



  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 spinner mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const profileCompleteness = () => {
    let completed = 0;
    const total = 4;
    
    if (user.name) completed++;
    if (user.bloodType) completed++;
    if (user.emergencyContacts && user.emergencyContacts.length > 0) completed++;
    if (user.publicToken) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const completeness = profileCompleteness();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Responsive Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg lg:text-xl font-bold">🛡️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">MedGuard</h1>
                <p className="text-xs lg:text-sm text-gray-600 hidden lg:block">Emergency Health Platform</p>
              </div>
            </div>

            {/* Desktop Navigation - Clean minimalist design */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-semibold text-gray-900 truncate max-w-40">{user.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Navigation - Simple user display */}
            <div className="lg:hidden flex items-center">
              <div className="text-right">
                <p className="text-xs text-gray-600">Welcome,</p>
                <p className="font-semibold text-gray-900 text-sm truncate max-w-32">{user.name.split(' ')[0]}</p>
              </div>
            </div>
          </div>


        </div>
      </header>

      {/* Main Content - Different for mobile vs desktop */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-12 pb-20 lg:pb-0">
        {/* Welcome Section - Desktop only */}
        <div className="hidden lg:block text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">
              Your Emergency Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your medical profile and emergency information
            </p>
          </div>
        </div>

        {/* Mobile Welcome Section - Simple */}
        <div className="lg:hidden text-center space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            Emergency Profile
          </h2>
          <p className="text-sm text-gray-600">
            Your medical information
          </p>
        </div>

        {/* Profile Completeness - Desktop only */}
        {completeness < 100 && (
          <div className="hidden lg:block bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600">
                  Your profile is {completeness}% complete. Add missing information for better emergency response.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600 mb-4">{completeness}%</div>
                <Link href="/profile" className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  Complete Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Desktop only */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          {/* Profile Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 text-center space-y-3 sm:space-y-4 group hover:shadow-xl transition-all">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <span className="text-2xl sm:text-3xl">👤</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Medical Profile</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {user.bloodType ? `Blood Type: ${user.bloodType}` : 'Incomplete Profile'}
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group text-sm sm:text-base"
              >
                {user.bloodType ? 'Update Profile' : 'Complete Profile'}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* QR Code Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 text-center space-y-3 sm:space-y-4 group hover:shadow-xl transition-all">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <span className="text-2xl sm:text-3xl">📱</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Emergency QR Code</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {user.publicToken ? 'Ready for emergencies' : 'Not generated'}
              </p>
              <Link
                href="/qr-code"
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group text-sm sm:text-base"
              >
                {user.publicToken ? 'View & Download' : 'Generate QR Code'}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 text-center space-y-3 sm:space-y-4 group hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <span className="text-2xl sm:text-3xl">👥</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Emergency Contacts</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {user.emergencyContacts?.length || 0} contacts configured
              </p>
              <button
                onClick={() => setIsContactsModalOpen(true)}
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group text-sm sm:text-base"
              >
                Manage Contacts
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Alert Section - Desktop only */}
        {user.bloodType && (user.emergencyContacts?.length || 0) > 0 && (
          <div className="hidden lg:block bg-white rounded-2xl p-12 shadow-lg border-2 border-red-100">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-2xl sm:text-3xl lg:text-4xl">🚨</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Emergency Alert System
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto px-4">
                    Send instant SOS alerts to your emergency contacts with your current location
                  </p>
                </div>
              </div>
              
              <div className="max-w-md mx-auto px-4">
                <AlertButton
                  userId={user.id}
                  variant="emergency"
                  size="lg"
                  onAlertSent={(success, message) => {
                    console.log(success ? 'Alert sent successfully' : 'Alert failed', message);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Desktop only */}
        <div className="hidden lg:block bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Quick Actions
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your emergency preparedness
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <Link
                href="/profile"
                className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all group"
              >
                <span className="mr-2">📝</span>
                <span className="text-sm sm:text-base">Update Medical Info</span>
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              
              <Link
                href="/qr-code"
                className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all group"
              >
                <span className="mr-2">📱</span>
                <span className="text-sm sm:text-base">View QR Code</span>
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              
              <button
                onClick={() => window.location.href = 'tel:911'}
                className="flex items-center justify-center px-4 py-3 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-medium transition-all group sm:col-span-2 lg:col-span-1"
              >
                <span className="mr-2">🚑</span>
                <span className="text-sm sm:text-base">Emergency Call</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Content - Account Info and QR Code Preview */}
        <div className="lg:hidden space-y-6">
          {/* Account Information - Mobile */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                Your Information
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                  <p className="text-base text-gray-900">{user.name}</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blood Type</label>
                  <p className="text-base text-gray-900">
                    {user.bloodType || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Contacts</label>
                  <p className="text-base text-gray-900">
                    {user.emergencyContacts?.length || 0} contacts
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profile Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${completeness === 100 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className={`text-sm font-medium ${completeness === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      {completeness}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Preview - Mobile */}
          {user.publicToken && (
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  Emergency QR Code
                </h3>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Your emergency medical information is ready
                  </p>
                  <Link
                    href="/qr-code"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    View Full QR Code
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Information - Desktop only */}
        <div className="hidden lg:block bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                  <p className="text-base sm:text-lg text-gray-900">{user.name}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                  <p className="text-base sm:text-lg text-gray-900 break-all">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Blood Type</label>
                  <p className="text-base sm:text-lg text-gray-900">
                    {user.bloodType || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Profile Status</label>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${completeness === 100 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className={`font-medium text-sm sm:text-base ${completeness === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      {completeness === 100 ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Information Notice - Desktop only */}
        <div className="hidden lg:block bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-10 h-10 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <span className="text-blue-600 text-xl sm:text-lg">ℹ️</span>
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold text-blue-900">Emergency Information</h4>
              <div className="text-blue-800 leading-relaxed space-y-2 text-sm sm:text-base">
                <p>
                  Your QR code provides instant access to your medical information in emergencies. 
                  Keep it with you at all times for fastest response from first responders.
                </p>
                <p className="text-xs sm:text-sm">
                  <strong>Remember:</strong> This platform assists in emergencies but should not replace 
                  professional medical advice. Always call 911 for immediate life-threatening situations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only (Flipkart style) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="grid grid-cols-5 h-16">
          {/* Dashboard */}
          <Link href="/dashboard" className="flex flex-col items-center justify-center space-y-1 bg-red-50 border-t-2 border-red-500">
            <span className="text-lg">🏠</span>
            <span className="text-xs font-medium text-red-600">Home</span>
          </Link>
          
          {/* Profile */}
          <Link href="/profile" className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors">
            <span className="text-lg">👤</span>
            <span className="text-xs text-gray-600">Profile</span>
          </Link>
          
          {/* QR Code */}
          <Link href="/qr-code" className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors">
            <span className="text-lg">📱</span>
            <span className="text-xs text-gray-600">QR Code</span>
          </Link>
          
          {/* Contacts */}
          <button
            onClick={() => setIsContactsModalOpen(true)}
            className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">👥</span>
            <span className="text-xs text-gray-600">Contacts</span>
          </button>
          
          {/* Emergency */}
          <button
            onClick={() => window.location.href = 'tel:911'}
            className="flex flex-col items-center justify-center space-y-1 bg-red-500 hover:bg-red-600 transition-colors"
          >
            <span className="text-lg text-white">🚑</span>
            <span className="text-xs text-white font-medium">Emergency</span>
          </button>
        </div>
      </div>

      {/* Contacts Modal */}
      <ContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        userId={user?.id || ''}
        initialContacts={user?.emergencyContacts || []}
        onContactsUpdated={async (contacts) => {
          console.log('Contacts updated:', contacts);
          await refreshUser();
        }}
      />
    </div>
  );
} 