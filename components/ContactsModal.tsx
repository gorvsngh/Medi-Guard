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
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', phone: '', relationship: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialContacts.length > 0) {
        setContacts(initialContacts);
      } else {
        setContacts([{ name: '', phone: '', relationship: '' }]);
      }
      setMessage({ type: '', text: '' });
    }
  }, [isOpen, initialContacts]);

  // Handle contact input change
  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    setContacts(prev => {
      const updatedContacts = [...prev];
      updatedContacts[index] = {
        ...updatedContacts[index],
        [name]: value,
      };
      return updatedContacts;
    });
  };

  // Add new contact
  const addContact = () => {
    setContacts(prev => [...prev, { name: '', phone: '', relationship: '' }]);
  };

  // Remove contact
  const removeContact = (index: number) => {
    setContacts(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated.length ? updated : [{ name: '', phone: '', relationship: '' }];
    });
  };

  // Submit contacts
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const validContacts = contacts.filter(contact => contact.name.trim() !== '');
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergencyContacts: validContacts,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Emergency contacts updated successfully!',
        });
        
        // Notify parent component
        if (onContactsUpdated) {
          onContactsUpdated(validContacts);
        }
        
        // Close modal after 1.5 seconds
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update contacts',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
      console.error('Contacts update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📞</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Emergency Contacts</h2>
                <p className="text-green-100">Manage your emergency contacts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-colors"
            >
              <span className="text-white text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Stats */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {contacts.filter(c => c.name.trim()).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Contacts</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {contacts.filter(c => c.phone.trim()).length}
                  </div>
                  <div className="text-sm text-gray-600">With Phone</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl animate-slideIn ${
              message.type === 'error' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center space-x-3">
                <span className="text-xl">
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

          {/* Contacts Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Add Contact Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Your Contacts</h3>
              <button
                type="button"
                onClick={addContact}
                className="btn-primary"
              >
                <span className="mr-2">➕</span>
                Add Contact
              </button>
            </div>

            {/* Contacts List */}
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 group hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {contact.name ? contact.name.charAt(0).toUpperCase() : '👤'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{contact.name || 'New Contact'}</span>
                          {index === 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {contact.relationship || 'No relationship specified'}
                          {contact.phone && (
                            <span className="ml-2 text-green-600">• {contact.phone}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50"
                        title="Remove contact"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        👤 Full Name {index === 0 && '*'}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={contact.name}
                        onChange={(e) => handleContactChange(e, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="Enter full name"
                        required={index === 0}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        📱 Phone Number {index === 0 && '*'}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(e, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="+1 (555) 123-4567"
                        required={index === 0}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        ❤️ Relationship {index === 0 && '*'}
                      </label>
                      <input
                        type="text"
                        name="relationship"
                        value={contact.relationship}
                        onChange={(e) => handleContactChange(e, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="e.g., Spouse, Parent"
                        required={index === 0}
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {contact.phone && (
                    <div className="mt-4 flex items-center space-x-3">
                      <a 
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        <span>📱</span>
                        <span>Call</span>
                      </a>
                      <a 
                        href={`sms:${contact.phone}`}
                        className="inline-flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        <span>💬</span>
                        <span>Text</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty State */}
              {contacts.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-gray-400 text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">No contacts yet</h3>
                    <p className="text-gray-600 text-sm">Add your first emergency contact</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>💾</span>
                    <span>Save Contacts</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 