'use client';

import { useState } from 'react';
import { useLocation } from '@/hooks/useLocation';

interface AlertButtonProps {
  userId?: string;
  publicToken?: string;
  variant?: 'primary' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onAlertSent?: (success: boolean, message: string) => void;
}

export default function AlertButton({
  userId,
  publicToken,
  variant = 'primary',
  size = 'md',
  className = '',
  onAlertSent,
}: AlertButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const { getCurrentLocation } = useLocation();

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white',
    emergency: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const handleSendAlert = async () => {
    if (!userId && !publicToken) {
      const errorMsg = 'Cannot send alert: No user or token provided';
      setMessage(errorMsg);
      setMessageType('error');
      onAlertSent?.(false, errorMsg);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Try to get current location
      let location = null;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.log('Could not get location:', error);
        // Continue without location
      }

      // Prepare request body
      const requestBody: {
        location?: { latitude: number; longitude: number } | null;
        customMessage: string;
        publicToken?: string;
      } = {
        location,
        customMessage: publicToken 
          ? 'Emergency alert triggered via QR code scan'
          : 'Emergency alert triggered from dashboard',
      };

      if (publicToken) {
        requestBody.publicToken = publicToken;
      }

      // Send emergency alert
      const response = await fetch('/api/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        const successMsg = `✅ Emergency alerts sent to ${data.alertsSent} contacts!`;
        setMessage(successMsg);
        setMessageType('success');
        onAlertSent?.(true, successMsg);
      } else {
        const errorMsg = data.message || 'Failed to send emergency alerts';
        setMessage(errorMsg);
        setMessageType('error');
        onAlertSent?.(false, errorMsg);
      }
    } catch (error) {
      console.error('Alert error:', error);
      const errorMsg = 'Network error. Please try again or call 911 directly.';
      setMessage(errorMsg);
      setMessageType('error');
      onAlertSent?.(false, errorMsg);
    } finally {
      setIsLoading(false);
      
      // Auto-clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleSendAlert}
        disabled={isLoading}
        className={`
          w-full font-bold rounded-lg transition-colors flex items-center justify-center space-x-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Sending Alert...</span>
          </>
        ) : (
          <>
            <span className="text-xl">📱</span>
            <span>SEND SOS ALERT</span>
          </>
        )}
      </button>

      {/* Alert Message */}
      {message && (
        <div
          className={`mt-3 p-3 rounded-md text-sm ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Location Warning */}
      <p className="mt-2 text-sm text-gray-600 text-center">
        🗺️ Location will be included if available
      </p>
    </div>
  );
} 