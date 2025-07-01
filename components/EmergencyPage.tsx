'use client';

import { useState } from 'react';
import AlertButton from '@/components/AlertButton';

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
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);

  const handleEmergencyCall = () => {
    window.location.href = 'tel:911';
  };

  const handleAlertResult = (success: boolean, message: string) => {
    setAlertType(success ? 'success' : 'error');
    setAlertMessage(message);
    
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      setAlertMessage(null);
      setAlertType(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-red-50">
      <div className="container-width py-8 space-y-8">
        {/* Emergency Header */}
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white text-5xl">🚨</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-red-800 tracking-tight">
              EMERGENCY MEDICAL INFO
            </h1>
            <p className="text-lg text-red-600 font-medium">
              Critical information for first responders
            </p>
          </div>
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <div className={`card-emergency ${
            alertType === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-100 border-red-300'
          } animate-slideIn`}>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                alertType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {alertMessage}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Call 911 */}
          <button
            onClick={handleEmergencyCall}
            className="card-emergency bg-red-600 hover:bg-red-700 text-white transform hover:scale-105 transition-all duration-200 group"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🚑</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">CALL 911</h2>
                <p className="text-red-100">
                  Immediate emergency services
                </p>
              </div>
            </div>
          </button>

          {/* Send SOS Alert */}
          <div className="card-emergency bg-orange-600 hover:bg-orange-700 text-white transform hover:scale-105 transition-all duration-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">📱</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">SEND SOS ALERT</h2>
                  <p className="text-orange-100">
                    Alert emergency contacts with location
                  </p>
                </div>
                <AlertButton
                  publicToken={user.publicToken}
                  variant="emergency"
                  size="md"
                  className="bg-white text-orange-600 hover:bg-gray-50"
                  onAlertSent={handleAlertResult}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="card-emergency space-y-6">
          <div className="border-b border-red-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-3xl mr-3">👤</span>
              Patient Information
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{user.name}</p>
              </div>
              
              {user.bloodType && (
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Blood Type
                  </label>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">🩸</span>
                    </div>
                    <span className="text-3xl font-bold text-red-600">
                      {user.bloodType}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        {(user.allergies.length > 0 || user.conditions.length > 0 || user.medications.length > 0) && (
          <div className="card-emergency space-y-8">
            <div className="border-b border-red-100 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">🏥</span>
                Medical Information
              </h2>
            </div>

            <div className="medical-info-grid space-y-8">
              {user.allergies.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">⚠️</span>
                    CRITICAL ALLERGIES
                  </h3>
                  <div className="space-y-3">
                    {user.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-lg font-medium text-red-800">{allergy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.conditions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🔍</span>
                    Medical Conditions
                  </h3>
                  <div className="space-y-3">
                    {user.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        <span className="text-lg text-yellow-800">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.medications.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">💊</span>
                    Current Medications
                  </h3>
                  <div className="space-y-3">
                    {user.medications.map((medication, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-lg text-blue-800">{medication}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        {user.emergencyContacts.length > 0 && (
          <div className="card-emergency space-y-6">
            <div className="border-b border-red-100 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">📞</span>
                Emergency Contacts
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {user.emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-lg">👤</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="btn-primary w-full justify-center group"
                  >
                    <span className="mr-2">📞</span>
                    Call {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-soft">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🛡️</span>
            </div>
            <span className="font-semibold text-gray-900">Powered by MedGuard</span>
          </div>
          <p className="text-sm text-gray-600">
            No login required in emergencies • Instant medical access
          </p>
        </div>
      </div>
    </div>
  );
} 