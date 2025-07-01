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
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
      <div className="loading-overlay">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 spinner mx-auto"></div>
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
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="container-width">
          <div className="flex items-center justify-between py-6">
            <Link href="/dashboard" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MedGuard</h1>
                <p className="text-sm text-gray-600">Emergency QR Code</p>
              </div>
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-width py-12 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">
              Your Emergency QR Code
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Print or save this QR code for emergency access to your medical information
            </p>
          </div>
        </div>

        {/* Alert Message */}
        {downloadMessage && (
          <div className="card bg-blue-50 border-blue-200 animate-slideIn">
            <div className="text-center">
              <p className="text-blue-800 font-medium">{downloadMessage}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* QR Code Display */}
          <div className="space-y-8">
            <div className="card text-center space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  🚨 Emergency Medical QR Code
                </h3>
                <p className="text-gray-600">
                  Scan this code for instant access to medical information
                </p>
              </div>
              
              {qrLoading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 spinner mx-auto"></div>
                    <p className="text-gray-600">Generating QR code...</p>
                  </div>
                </div>
              )}

              {qrError && (
                <div className="alert-error">
                  <div className="flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Error generating QR code: {qrError}</span>
                  </div>
                </div>
              )}

              {isReady && dataURL && (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 inline-block shadow-soft">
                    <img 
                      src={dataURL} 
                      alt="Emergency QR Code" 
                      className="w-80 h-80 mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-full">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="font-medium">No login required</span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-2">Emergency URL:</p>
                      <code className="text-xs bg-white px-3 py-2 rounded-lg text-gray-600 break-all">
                        {qrCodeUrl}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions and Information */}
          <div className="space-y-8">
            {/* Download Options */}
            <div className="card space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                💾 Download Options
              </h3>
              <div className="space-y-4">
                <button
                  onClick={handleDownloadPNG}
                  disabled={!isReady}
                  className="btn-primary w-full group disabled:opacity-50"
                >
                  <span className="mr-3">📱</span>
                  Download PNG (For Phone)
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
                
                <button
                  onClick={handleDownloadSVG}
                  disabled={!isReady}
                  className="btn-secondary w-full group disabled:opacity-50"
                >
                  <span className="mr-3">🖼️</span>
                  Download SVG (High Quality)
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
                
                <button
                  onClick={handlePrint}
                  disabled={!isReady}
                  className="btn-outline w-full group disabled:opacity-50"
                >
                  <span className="mr-3">🖨️</span>
                  Print QR Code
                </button>
                
                <button
                  onClick={handleCopyUrl}
                  disabled={!isReady}
                  className="btn-secondary w-full group disabled:opacity-50"
                >
                  <span className="mr-3">📋</span>
                  Copy URL
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="card space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
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
            <div className="card space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                👤 Profile Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Blood Type:</span>
                  <span className={`font-semibold ${user.bloodType ? 'text-red-600' : 'text-gray-400'}`}>
                    {user.bloodType || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Status:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user.bloodType ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className={`font-semibold ${user.bloodType ? 'text-green-600' : 'text-orange-600'}`}>
                      {user.bloodType ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
              
              {!user.bloodType && (
                <Link href="/profile" className="btn-primary w-full group">
                  Complete your profile
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
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
    </div>
  );
} 