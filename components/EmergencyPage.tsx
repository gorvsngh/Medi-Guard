'use client';

import { useState } from 'react';
import { useLocation } from '@/hooks/useLocation';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface EmergencyUser {
  id: string;
  name: string;
  bloodType?: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContacts: EmergencyContact[];
  publicToken: string;
}

interface EmergencyPageProps {
  user: EmergencyUser;
}

export default function EmergencyPage({ user }: EmergencyPageProps) {
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);
  
  const {
    getCurrentLocation,
    loading: locationLoading,
    error: locationError,
  } = useLocation();

  const handleEmergencyCall = () => {
    window.location.href = 'tel:911';
  };

  const handleSendAlert = async () => {
    setAlertLoading(true);
    setAlertMessage(null);
    setAlertType(null);

    try {
      // Try to get current location
      let location = null;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.log('Could not get location:', error);
        // Continue without location
      }

      // Send emergency alert
      const response = await fetch('/api/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicToken: user.publicToken,
          location,
          customMessage: 'Emergency alert triggered via QR code scan',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType('success');
        setAlertMessage(`✅ Emergency alerts sent to ${data.alertsSent} contacts!`);
      } else {
        setAlertType('error');
        setAlertMessage(data.message || 'Failed to send emergency alerts');
      }
    } catch (error) {
      console.error('Alert error:', error);
      setAlertType('error');
      setAlertMessage('Network error. Please try again or call 911 directly.');
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🚨</div>
          <h1 className="text-2xl font-bold text-red-800 mb-1">
            EMERGENCY MEDICAL INFO
          </h1>
          <p className="text-red-600 text-sm">
            Critical information for first responders
          </p>
        </div>

        {/* Patient Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">👤</span>
            Patient Information
          </h2>
          
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-700">Name:</span>
              <span className="ml-2 text-lg">{user.name}</span>
            </div>
            
            {user.bloodType && (
              <div>
                <span className="font-semibold text-gray-700">Blood Type:</span>
                <span className="ml-2 text-lg font-bold text-red-600">
                  {user.bloodType}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Medical Information */}
        {(user.allergies.length > 0 || user.conditions.length > 0 || user.medications.length > 0) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏥</span>
              Medical Information
            </h2>

            {user.allergies.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-700 mb-2">⚠️ ALLERGIES:</h3>
                <div className="bg-red-100 p-3 rounded">
                  {user.allergies.map((allergy, index) => (
                    <div key={index} className="text-red-800 font-medium">
                      • {allergy}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.conditions.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Medical Conditions:</h3>
                <div className="bg-yellow-100 p-3 rounded">
                  {user.conditions.map((condition, index) => (
                    <div key={index} className="text-yellow-800">
                      • {condition}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.medications.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Current Medications:</h3>
                <div className="bg-blue-100 p-3 rounded">
                  {user.medications.map((medication, index) => (
                    <div key={index} className="text-blue-800">
                      • {medication}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emergency Contacts */}
        {user.emergencyContacts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📞</span>
              Emergency Contacts
            </h2>
            
            <div className="space-y-3">
              {user.emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-gray-600">{contact.relationship}</div>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert Message */}
        {alertMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            alertType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {alertMessage}
          </div>
        )}

        {/* Emergency Action Buttons */}
        <div className="space-y-4">
          {/* Call 911 Button */}
          <button
            onClick={handleEmergencyCall}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <span className="text-2xl">🚑</span>
            <span>CALL 911</span>
          </button>

          {/* Send Alert Button */}
          <button
            onClick={handleSendAlert}
            disabled={alertLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-xl flex items-center justify-center space-x-2 transition-colors"
          >
            {alertLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Sending Alert...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">📱</span>
                <span>SEND SOS ALERT</span>
              </>
            )}
          </button>

          {locationError && (
            <p className="text-yellow-700 text-sm text-center">
              ⚠️ Location not available. Alert will be sent without location.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <div className="mb-2">
            🛡️ Powered by MedGuard Emergency Platform
          </div>
          <div>
            No login required in emergencies
          </div>
        </div>
      </div>
    </div>
  );
} 