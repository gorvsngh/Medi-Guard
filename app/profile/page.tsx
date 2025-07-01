'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

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
        
        // Update auth context
        // This would typically happen automatically if your auth provider refreshes on changes
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
      <div className="loading-overlay">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 spinner mx-auto"></div>
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
    <div className="min-h-screen bg-gradient-primary">
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
                <p className="text-sm text-gray-600">Medical Profile</p>
              </div>
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-width py-12 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">
              Complete Your <span className="text-gradient">Medical Profile</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help first responders save your life by providing critical medical information
            </p>
          </div>
          
          {/* Completion Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-red-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`card animate-slideIn ${
            message.type === 'error' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="card space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                <p className="text-gray-600">Basic details for emergency identification</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bloodType" className="form-label">
                  Blood Type *
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="form-input"
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
          <div className="card space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">🏥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Medical Information</h3>
                <p className="text-gray-600">Critical health details for emergency care</p>
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚠️</span>
                <h4 className="text-lg font-medium text-gray-900">Allergies</h4>
              </div>
              {formData.allergies.map((allergy, index) => (
                <div key={`allergy-${index}`} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={allergy}
                    onChange={(e) => handleArrayChange(e, index, 'allergies')}
                    placeholder="e.g., Penicillin, Peanuts, Shellfish"
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'allergies')}
                    className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                    disabled={formData.allergies.length === 1}
                  >
                    −
                  </button>
                  {index === formData.allergies.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddItem('allergies')}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Medical Conditions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🩺</span>
                <h4 className="text-lg font-medium text-gray-900">Medical Conditions</h4>
              </div>
              {formData.conditions.map((condition, index) => (
                <div key={`condition-${index}`} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => handleArrayChange(e, index, 'conditions')}
                    placeholder="e.g., Diabetes, Asthma, Heart Disease"
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'conditions')}
                    className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                    disabled={formData.conditions.length === 1}
                  >
                    −
                  </button>
                  {index === formData.conditions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddItem('conditions')}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💊</span>
                <h4 className="text-lg font-medium text-gray-900">Current Medications</h4>
              </div>
              {formData.medications.map((medication, index) => (
                <div key={`medication-${index}`} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={medication}
                    onChange={(e) => handleArrayChange(e, index, 'medications')}
                    placeholder="e.g., Insulin, Lisinopril, Metformin"
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'medications')}
                    className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                    disabled={formData.medications.length === 1}
                  >
                    −
                  </button>
                  {index === formData.medications.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleAddItem('medications')}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">📞</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Emergency Contacts</h3>
                  <p className="text-gray-600">Manage your emergency contacts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem('emergencyContacts')}
                className="btn-secondary group"
              >
                <span className="mr-2">➕</span>
                Add Contact
              </button>
            </div>

            <div className="space-y-4">
              {formData.emergencyContacts.map((contact, index) => (
                <div key={`contact-${index}`} className="bg-gray-50 rounded-xl p-6 transition-all hover:bg-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {contact.name ? contact.name.charAt(0).toUpperCase() : '👤'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{contact.name || 'New Contact'}</span>
                          {index === 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Primary</span>}
                        </h4>
                        <p className="text-gray-600 text-sm">{contact.relationship || 'No relationship specified'}</p>
                      </div>
                    </div>
                    {formData.emergencyContacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index, 'emergencyContacts')}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        title="Remove contact"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={contact.name}
                        onChange={(e) => handleChange(e, index, 'emergencyContacts')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="Enter full name"
                        required={index === 0}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={contact.phone}
                        onChange={(e) => handleChange(e, index, 'emergencyContacts')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="+1 (555) 123-4567"
                        required={index === 0}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Relationship</label>
                      <input
                        type="text"
                        name="relationship"
                        value={contact.relationship}
                        onChange={(e) => handleChange(e, index, 'emergencyContacts')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="e.g., Spouse, Parent, Friend"
                        required={index === 0}
                      />
                    </div>
                  </div>

                  {contact.phone && (
                    <div className="mt-4 flex items-center space-x-3">
                      <a 
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        <span>📱</span>
                        <span>Call {contact.name}</span>
                      </a>
                      <a 
                        href={`sms:${contact.phone}`}
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <span>💬</span>
                        <span>Text</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {formData.emergencyContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📞</span>
                  <p>No emergency contacts added yet</p>
                  <p className="text-sm">Add at least one contact for emergencies</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-2xl">🔒</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800">Privacy & Security</h4>
                <p className="text-amber-700 leading-relaxed">
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
              className="btn-emergency px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Profile...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span>💾</span>
                  <span>Save Medical Profile</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              )}
            </button>
            
            <p className="text-gray-600 text-sm">
              Your profile will be immediately available for emergency access
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
