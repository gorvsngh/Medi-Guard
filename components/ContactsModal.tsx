'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Contact {
  name: string;
  phone: string;
  relationship: string;
}

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialContacts?: Contact[];
  onContactsUpdated?: (contacts: Contact[]) => void;
}

export default function ContactsModal({
  isOpen,
  onClose,
  userId,
  initialContacts = [],
  onContactsUpdated
}: ContactsModalProps) {
  const [existingContacts, setExistingContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState<Contact>({
    name: '',
    phone: '',
    relationship: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      setExistingContacts(initialContacts);
      setShowAddForm(false);
      setNewContact({ name: '', phone: '', relationship: '' });
      setMessage({ type: '', text: '' });
    }
  }, [isOpen, initialContacts]);

  // Handle new contact input change
  const handleNewContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
        [name]: value,
    }));
  };

  // Add new contact
  const handleAddContact = async (e: FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedContacts = [...existingContacts, newContact];
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyContacts: updatedContacts,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Contact added successfully!',
        });
        
        setExistingContacts(updatedContacts);
        setNewContact({ name: '', phone: '', relationship: '' });
        setShowAddForm(false);
        
        // Notify parent component
        if (onContactsUpdated) {
          onContactsUpdated(updatedContacts);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to add contact',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
      console.error('Contact add error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove contact
  const handleRemoveContact = async (indexToRemove: number) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedContacts = existingContacts.filter((_, index) => index !== indexToRemove);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyContacts: updatedContacts,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Contact removed successfully!',
        });
        
        setExistingContacts(updatedContacts);
        
        // Notify parent component
        if (onContactsUpdated) {
          onContactsUpdated(updatedContacts);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to remove contact',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
      console.error('Contact remove error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 ${
        isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full sm:translate-y-0 opacity-0 scale-95'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-600 text-lg sm:text-xl">📞</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Emergency Contacts</h2>
                <p className="text-sm text-gray-600 hidden sm:block">
                  {existingContacts.length} contact{existingContacts.length !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
            >
              <span className="text-gray-600 text-lg sm:text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto">
          {/* Alert Message */}
          {message.text && (
            <div 
              className={`mb-4 sm:mb-6 p-4 rounded-xl transform transition-all duration-300 ease-out ${
              message.type === 'error' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg sm:text-xl">
                  {message.type === 'error' ? '❌' : '✅'}
                </span>
                <p className={`font-medium text-sm sm:text-base ${
                  message.type === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Existing Contacts - Compact Summary */}
          {existingContacts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Contacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {existingContacts.map((contact, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-xl p-4 flex items-center justify-between group hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3 flex-1">
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
                    
                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 ml-3">
                      <a 
                        href={`tel:${contact.phone}`}
                        className="w-8 h-8 bg-gray-200 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200"
                        title="Call"
                      >
                        <span className="text-sm">📱</span>
                      </a>
                      <button
                        onClick={() => handleRemoveContact(index)}
                        disabled={isSubmitting}
                        className="w-8 h-8 bg-gray-200 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Remove contact"
                      >
                        <span className="text-sm">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Contact Section */}
          <div className="space-y-4">
            {/* Add Contact Button */}
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
            >
              <span className={`transition-transform duration-200 ${showAddForm ? 'rotate-45' : ''}`}>
                ➕
              </span>
              <span>{showAddForm ? 'Cancel' : 'Add New Contact'}</span>
            </button>

            {/* Add Contact Form - Slides in below button */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                showAddForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <form onSubmit={handleAddContact} className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
                <h4 className="font-medium text-gray-900 mb-4">New Contact Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                      Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                      value={newContact.name}
                      onChange={handleNewContactChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                        placeholder="Enter full name"
                      required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                      Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                      value={newContact.phone}
                      onChange={handleNewContactChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                        placeholder="+1 (555) 123-4567"
                      required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                      Relationship *
                      </label>
                      <input
                        type="text"
                        name="relationship"
                      value={newContact.relationship}
                      onChange={handleNewContactChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 text-base"
                        placeholder="e.g., Spouse, Parent"
                      required
                      />
                    </div>
                  </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end pt-4 space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewContact({ name: '', phone: '', relationship: '' });
                    }}
                    className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newContact.name.trim()}
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>💾</span>
                        <span>Add Contact</span>
                    </div>
                  )}
                  </button>
                </div>
              </form>
            </div>
          </div>

              {/* Empty State */}
          {existingContacts.length === 0 && !showAddForm && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-gray-400 text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">No contacts yet</h3>
                <p className="text-gray-600 text-sm">Add your first emergency contact to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {existingContacts.length} of 5 contacts
            </p>
              <button
                onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-colors duration-200"
            >
              Done
              </button>
            </div>
        </div>
      </div>
    </div>
  );
} 