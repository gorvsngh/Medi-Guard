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
  }, []);

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
    let total = 4;
    
    if (user.name) completed++;
    if (user.bloodType) completed++;
    if (user.emergencyContacts && user.emergencyContacts.length > 0) completed++;
    if (user.publicToken) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const completeness = profileCompleteness();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-width">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedGuard</h1>
                <p className="text-sm text-gray-600">Emergency Health Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-width py-12 space-y-12">
        {/* Welcome Section */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">
              Your Emergency Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your medical profile and emergency information
            </p>
          </div>
        </div>

        {/* Profile Completeness */}
        {completeness < 100 && (
          <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
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
                <div className="text-3xl font-bold text-orange-600">{completeness}%</div>
                <Link href="/profile" className="btn-primary mt-4">
                  Complete Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Status */}
          <div className="card-compact text-center space-y-4 group hover:shadow-medium">
            <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <span className="text-3xl">👤</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Medical Profile</h3>
              <p className="text-gray-600">
                {user.bloodType ? `Blood Type: ${user.bloodType}` : 'Incomplete Profile'}
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group"
              >
                {user.bloodType ? 'Update Profile' : 'Complete Profile'}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* QR Code Status */}
          <div className="card-compact text-center space-y-4 group hover:shadow-medium">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <span className="text-3xl">📱</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Emergency QR Code</h3>
              <p className="text-gray-600">
                {user.publicToken ? 'Ready for emergencies' : 'Not generated'}
              </p>
              <Link
                href="/qr-code"
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group"
              >
                {user.publicToken ? 'View & Download' : 'Generate QR Code'}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="card-compact text-center space-y-4 group hover:shadow-medium">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <span className="text-3xl">👥</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Emergency Contacts</h3>
              <p className="text-gray-600">
                {user.emergencyContacts?.length || 0} contacts configured
              </p>
              <button
                onClick={() => setIsContactsModalOpen(true)}
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group"
              >
                Manage Contacts
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Alert Section */}
        {user.bloodType && (user.emergencyContacts?.length || 0) > 0 && (
          <div className="card-emergency">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl">🚨</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Emergency Alert System
                  </h3>
                  <p className="text-gray-600 max-w-lg mx-auto">
                    Send instant SOS alerts to your emergency contacts with your current location
                  </p>
                </div>
              </div>
              
              <div className="max-w-md mx-auto">
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

        {/* Quick Actions */}
        <div className="card">
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-semibold text-gray-900">
                Quick Actions
              </h3>
              <p className="text-gray-600">
                Manage your emergency preparedness
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/profile"
                className="btn-secondary group justify-center"
              >
                <span className="mr-2">📝</span>
                Update Medical Info
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              
              <Link
                href="/qr-code"
                className="btn-secondary group justify-center"
              >
                <span className="mr-2">📱</span>
                View QR Code
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              
              <button
                onClick={() => window.location.href = 'tel:911'}
                className="btn-outline group justify-center border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <span className="mr-2">🚑</span>
                Emergency Call
              </button>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="card">
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-gray-900">
              Account Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Blood Type</label>
                  <p className="text-lg text-gray-900">
                    {user.bloodType || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Profile Status</label>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${completeness === 100 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className={`font-medium ${completeness === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      {completeness === 100 ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Information Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-lg">ℹ️</span>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-blue-900">Emergency Information</h4>
              <div className="text-blue-800 leading-relaxed space-y-2">
                <p>
                  Your QR code provides instant access to your medical information in emergencies. 
                  Keep it with you at all times for fastest response from first responders.
                </p>
                <p className="text-sm">
                  <strong>Remember:</strong> This platform assists in emergencies but should not replace 
                  professional medical advice. Always call 911 for immediate life-threatening situations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

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