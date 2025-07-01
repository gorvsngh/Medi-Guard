'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ContactsModal from '@/components/ContactsModal';

// Extend the User interface to include all profile fields
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  bloodType?: string;
  publicToken?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
}

// Blood type options
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, loading } = useAuth();
  // Cast the user to our extended interface
  const user = authUser as ExtendedUser | null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bloodType: '',
    allergies: [''],
    conditions: [''],
    medications: [''],
    emergencyContacts: [
      {
        name: '',
        phone: '',
        relationship: '',
      },
    ],
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push('/login');
    }
  }, [user, loading, router, isLoggingOut]);

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bloodType: user.bloodType || '',
        allergies: user.allergies?.length ? user.allergies : [''],
        conditions: user.conditions?.length ? user.conditions : [''],
        medications: user.medications?.length ? user.medications : [''],
        emergencyContacts: user.emergencyContacts?.length
          ? user.emergencyContacts
          : [{ name: '', phone: '', relationship: '' }],
      });
    }
  }, [user]);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 5;
    
    if (formData.name.trim()) completed++;
    if (formData.bloodType) completed++;
    if (formData.allergies.some(a => a.trim())) completed++;
    if (formData.conditions.some(c => c.trim())) completed++;
    if (formData.emergencyContacts.some(c => c.name.trim() && c.phone.trim())) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number,
    field?: string
  ) => {
    const { name, value } = e.target;

    if (field && typeof index === 'number') {
      // Handle array items with object values (emergency contacts)
      setFormData((prev) => {
        const updatedArray = [...prev[field as keyof typeof prev]] as any;
        updatedArray[index] = {
          ...updatedArray[index],
          [name]: value,
        };
        return {
          ...prev,
          [field]: updatedArray,
        };
      });
    } else {
      // Handle simple inputs
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle array input change
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: 'allergies' | 'conditions' | 'medications'
  ) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return {
        ...prev,
        [field]: updatedArray,
      };
    });
  };

  // Add new item to array
  const handleAddItem = (field: 'allergies' | 'conditions' | 'medications' | 'emergencyContacts') => {
    setFormData((prev) => {
      if (field === 'emergencyContacts') {
        return {
          ...prev,
          [field]: [...prev[field], { name: '', phone: '', relationship: '' }],
        };
      } else {
        return {
          ...prev,
          [field]: [...prev[field], ''],
        };
      }
    });
  };

  // Remove item from array
  const handleRemoveItem = (
    index: number,
    field: 'allergies' | 'conditions' | 'medications' | 'emergencyContacts'
  ) => {
    setFormData((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray.splice(index, 1);
      return {
        ...prev,
        [field]: updatedArray.length ? updatedArray : [''],
      };
    });
  };

  // Handle contacts updated from modal
  const handleContactsUpdated = (contacts: any[]) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: contacts
    }));
  };

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Filter out empty values
      const dataToSubmit = {
        ...formData,
        allergies: formData.allergies.filter((item) => item.trim() !== ''),
        conditions: formData.conditions.filter((item) => item.trim() !== ''),
        medications: formData.medications.filter((item) => item.trim() !== ''),
        emergencyContacts: formData.emergencyContacts.filter((contact) => contact.name.trim() !== ''),
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg lg:text-xl font-bold">🛡️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">MedGuard</h1>
                <p className="text-xs lg:text-sm text-gray-600">Medical Profile</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <Link href="/dashboard" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]">
                ← Back to Dashboard
              </Link>
            </div>

            {/* Mobile - Simple title */}
            <div className="lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
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
              Complete Your <span className="text-gray-900">Medical Profile</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help first responders save your life by providing critical medical information
            </p>
          </div>
          
          {/* Completion Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-900 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mobile Header - Simple */}
        <div className="lg:hidden text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Medical Profile
          </h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion</span>
              <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`bg-white rounded-xl p-4 shadow-sm border-2 transform transition-all duration-300 ease-out ${
            message.type === 'error' 
              ? 'border-red-200 bg-red-50' 
              : 'border-green-200 bg-green-50'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-lg">
                {message.type === 'error' ? '❌' : '✅'}
              </span>
              <p className={`font-medium ${
                message.type === 'error' ? 'text-red-800' : 'text-green-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-600 text-lg sm:text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600">Basic details for emergency identification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bloodType" className="text-sm font-medium text-gray-700">
                  Blood Type *
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                  required
                >
                  <option value="">Select Blood Type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-600 text-lg sm:text-xl">🏥</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Medical Information</h3>
                <p className="text-sm text-gray-600">Critical health details for emergency care</p>
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚠️</span>
                <h4 className="text-base sm:text-lg font-medium text-gray-900">Allergies</h4>
              </div>
              {formData.allergies.map((allergy, index) => (
                <div key={`allergy-${index}`} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={allergy}
                    onChange={(e) => handleArrayChange(e, index, 'allergies')}
                    placeholder="e.g., Penicillin, Peanuts, Shellfish"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'allergies')}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                    disabled={formData.allergies.length === 1}
                  >
                    <span className="text-lg">−</span>
                  </button>
                  {index === formData.allergies.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddItem('allergies')}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-[1.05]"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Medical Conditions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🩺</span>
                <h4 className="text-base sm:text-lg font-medium text-gray-900">Medical Conditions</h4>
              </div>
              {formData.conditions.map((condition, index) => (
                <div key={`condition-${index}`} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => handleArrayChange(e, index, 'conditions')}
                    placeholder="e.g., Diabetes, Asthma, Heart Disease"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'conditions')}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                    disabled={formData.conditions.length === 1}
                  >
                    <span className="text-lg">−</span>
                  </button>
                  {index === formData.conditions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddItem('conditions')}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-[1.05]"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💊</span>
                <h4 className="text-base sm:text-lg font-medium text-gray-900">Current Medications</h4>
              </div>
              {formData.medications.map((medication, index) => (
                <div key={`medication-${index}`} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={medication}
                    onChange={(e) => handleArrayChange(e, index, 'medications')}
                    placeholder="e.g., Insulin, Lisinopril, Metformin"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'medications')}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                    disabled={formData.medications.length === 1}
                  >
                    <span className="text-lg">−</span>
                  </button>
                  {index === formData.medications.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddItem('medications')}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-[1.05]"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 text-lg sm:text-xl">📞</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Emergency Contacts</h3>
                  <p className="text-sm text-gray-600">{formData.emergencyContacts.filter(c => c.name.trim()).length} contact{formData.emergencyContacts.filter(c => c.name.trim()).length !== 1 ? 's' : ''} added</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContactsModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-[1.02]"
              >
                <span>📞</span>
                <span>Manage Contacts</span>
              </button>
            </div>

            {/* Contacts Summary */}
            {formData.emergencyContacts.filter(c => c.name.trim()).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.emergencyContacts.filter(c => c.name.trim()).map((contact, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-700 font-bold text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {contact.name}
                        </h4>
                        {index === 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full flex-shrink-0">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs truncate">
                        {contact.relationship} • {contact.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-gray-400 text-xl">📞</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">No contacts added yet</h4>
                  <p className="text-gray-600 text-sm">Add emergency contacts to help first responders</p>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice - Desktop only */}
          <div className="hidden lg:block bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-2xl">🔒</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Privacy & Security</h4>
                <p className="text-gray-700 leading-relaxed">
                  Your medical information is encrypted and secure. Only emergency responders with access to your QR code can view this information during emergencies.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Profile...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span>💾</span>
                  <span>Save Medical Profile</span>
                </div>
              )}
            </button>
            
            <p className="text-gray-600 text-sm">
              Your profile will be immediately available for emergency access
            </p>
          </div>
        </form>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="grid grid-cols-5 h-16">
          {/* Dashboard */}
          <Link href="/dashboard" className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors duration-200">
            <span className="text-lg">🏠</span>
            <span className="text-xs text-gray-600">Home</span>
          </Link>
          
          {/* Profile */}
          <Link href="/profile" className="flex flex-col items-center justify-center space-y-1 bg-red-50 border-t-2 border-red-500">
            <span className="text-lg">👤</span>
            <span className="text-xs font-medium text-red-600">Profile</span>
          </Link>
          
          {/* QR Code */}
          <Link href="/qr-code" className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors duration-200">
            <span className="text-lg">📱</span>
            <span className="text-xs text-gray-600">QR Code</span>
          </Link>
          
          {/* Contacts */}
          <button
            onClick={() => setShowContactsModal(true)}
            className="flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="text-lg">👥</span>
            <span className="text-xs text-gray-600">Contacts</span>
          </button>
          
          {/* Emergency */}
          <button
            onClick={() => window.location.href = 'tel:911'}
            className="flex flex-col items-center justify-center space-y-1 bg-red-500 hover:bg-red-600 transition-colors duration-200"
          >
            <span className="text-lg text-white">🚑</span>
            <span className="text-xs text-white font-medium">Emergency</span>
          </button>
        </div>
      </div>

      {/* Contacts Modal */}
      <ContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        userId={user.id}
        initialContacts={formData.emergencyContacts.filter(c => c.name.trim())}
        onContactsUpdated={handleContactsUpdated}
      />
    </div>
  );
}
