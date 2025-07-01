'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useQRCode } from '@/hooks/useQRCode';

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  bloodType?: string;
  publicToken?: string;
  publicUrl?: string;
}

export default function QRCodePage() {
  const router = useRouter();
  const { user: authUser, loading } = useAuth();
  const user = authUser as ExtendedUser | null;
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [downloadMessage, setDownloadMessage] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Generate QR code URL
  useEffect(() => {
    if (user?.publicToken) {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_DOMAIN || window.location.origin
        : window.location.origin;
      setQrCodeUrl(`${baseUrl}/public/${user.publicToken}`);
    }
  }, [user]);

  // Memoize QR code options to prevent infinite re-renders
  const qrOptions = useMemo(() => ({
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H' as const,
  }), []);

  const {
    dataURL,
    svg,
    loading: qrLoading,
    error: qrError,
    downloadQRCode,
    downloadQRCodeSVG,
    printQRCode,
    copyToClipboard,
    isReady,
  } = useQRCode(qrCodeUrl, qrOptions);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push('/login');
    }
  }, [user, loading, router, isLoggingOut]);

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setDownloadMessage(`${type === 'success' ? '✅' : '❌'} ${message}`);
    setTimeout(() => setDownloadMessage(''), 3000);
  };

  const handleDownloadPNG = async () => {
    try {
      await downloadQRCode('medguard-emergency-qr');
      showMessage('QR code downloaded successfully!');
    } catch (error) {
      showMessage('Download failed. Please try again.', 'error');
    }
  };

  const handleDownloadSVG = async () => {
    try {
      await downloadQRCodeSVG('medguard-emergency-qr');
      showMessage('SVG QR code downloaded successfully!');
    } catch (error) {
      showMessage('Download failed. Please try again.', 'error');
    }
  };

  const handlePrint = () => {
    try {
      printQRCode();
      showMessage('Print dialog opened!');
    } catch (error) {
      showMessage('Print failed. Please try again.', 'error');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await copyToClipboard();
      showMessage('URL copied to clipboard!');
    } catch (error) {
      showMessage('Copy failed. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading QR code...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Desktop with navigation, Mobile clean */}
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
                <p className="text-xs lg:text-sm text-gray-600">Emergency QR Code</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <Link href="/dashboard" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                ← Back to Dashboard
              </Link>
            </div>

            {/* Mobile - Simple title */}
            <div className="lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">QR Code</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-12 pb-20 lg:pb-0">
        {/* Page Header - Desktop */}
        <div className="hidden lg:block text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">
              Your Emergency QR Code
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Print or save this QR code for emergency access to your medical information
            </p>
          </div>
        </div>

        {/* Mobile Header - Simple */}
        <div className="lg:hidden text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Emergency QR Code
          </h2>
          <p className="text-sm text-gray-600">
            Scan for instant medical access
          </p>
        </div>

        {/* Alert Message */}
        {downloadMessage && (
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-blue-200 bg-blue-50">
            <div className="text-center">
              <p className="text-blue-800 font-medium">{downloadMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* QR Code Display */}
          <div className="space-y-6 lg:space-y-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 text-center space-y-6 lg:space-y-8">
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  🚨 Emergency Medical QR Code
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Scan this code for instant access to medical information
                </p>
              </div>
              
              {qrLoading && (
                <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600">Generating QR code...</p>
                  </div>
                </div>
              )}

              {qrError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <span>⚠️</span>
                    <span className="text-sm">Error generating QR code: {qrError}</span>
                  </div>
                </div>
              )}

              {isReady && dataURL && (
                <div className="space-y-6 lg:space-y-8">
                  <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border-2 border-gray-200 inline-block shadow-sm">
                    <img 
                      src={dataURL} 
                      alt="Emergency QR Code" 
                      className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-full">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="font-medium text-sm">No login required</span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">Emergency URL:</p>
                      <code className="text-xs bg-white px-3 py-2 rounded-lg text-gray-600 break-all block">
                        {qrCodeUrl}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions and Information */}
          <div className="space-y-6 lg:space-y-8">
            {/* Download Options */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                💾 Download Options
              </h3>
              <div className="space-y-3 lg:space-y-4">
                <button
                  onClick={handleDownloadPNG}
                  disabled={!isReady}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  <span>📱</span>
                  <span>Download PNG (For Phone)</span>
                </button>
                
                <button
                  onClick={handleDownloadSVG}
                  disabled={!isReady}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  <span>🖼️</span>
                  <span>Download SVG (High Quality)</span>
                </button>
                
                <button
                  onClick={handlePrint}
                  disabled={!isReady}
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  <span>🖨️</span>
                  <span>Print QR Code</span>
                </button>
                
                <button
                  onClick={handleCopyUrl}
                  disabled={!isReady}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  <span>📋</span>
                  <span>Copy URL</span>
                </button>
              </div>
            </div>

            {/* Instructions - Desktop only */}
            <div className="hidden lg:block bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                📋 Instructions
              </h3>
              <div className="space-y-4">
                {[
                  "Print this QR code and keep it in your wallet, purse, or on your phone case",
                  "In emergencies, anyone can scan this code to see your medical information",
                  "No login required - instant access for first responders",
                  "Emergency contacts can be alerted with your location"
                ].map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Status */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                👤 Profile Status
              </h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Name:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-40">{user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Blood Type:</span>
                  <span className={`font-semibold text-sm sm:text-base ${user.bloodType ? 'text-red-600' : 'text-gray-400'}`}>
                    {user.bloodType || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Profile Status:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user.bloodType ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className={`font-semibold text-sm sm:text-base ${user.bloodType ? 'text-green-600' : 'text-orange-600'}`}>
                      {user.bloodType ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
              
              {!user.bloodType && (
                <div className="mt-4 lg:mt-6">
                  <Link href="/profile" className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2">
                    <span>Complete your profile</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Security Notice - Desktop only */}
            <div className="hidden lg:block bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 text-2xl">⚠️</span>
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-800">Security Notice</h4>
                  <p className="text-yellow-700 leading-relaxed">
                    This QR code provides access to your emergency medical information. 
                    Only share it with trusted individuals or keep it for emergency use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="grid grid-cols-5 h-16">
          {/* Dashboard */}
          <Link href="/dashboard" className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors">
            <span className="text-lg">🏠</span>
            <span className="text-xs text-gray-600">Home</span>
          </Link>
          
          {/* Profile */}
          <Link href="/profile" className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors">
            <span className="text-lg">👤</span>
            <span className="text-xs text-gray-600">Profile</span>
          </Link>
          
          {/* QR Code */}
          <Link href="/qr-code" className="flex flex-col items-center justify-center space-y-1 bg-red-50 border-t-2 border-red-500">
            <span className="text-lg">📱</span>
            <span className="text-xs font-medium text-red-600">QR Code</span>
          </Link>
          
          {/* Contacts */}
          <button
            onClick={() => {/* Open contacts modal if available */}}
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
    </div>
  );
} 