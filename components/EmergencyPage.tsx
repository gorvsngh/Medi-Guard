'use client';

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
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#dc2626', fontSize: '32px', marginBottom: '10px' }}>
          🚨 EMERGENCY MEDICAL INFO
        </h1>
        <p style={{ color: '#dc2626', fontSize: '18px' }}>
          Critical information for first responders
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <a 
          href="tel:911" 
          style={{
            display: 'block',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}
        >
          🚑 CALL 911 - EMERGENCY
        </a>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #fecaca' }}>
        <h2 style={{ color: '#374151', marginBottom: '15px' }}>👤 Patient Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        {user.bloodType && <p><strong>Blood Type:</strong> {user.bloodType}</p>}
      </div>

      {user.allergies.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #fca5a5' }}>
          <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>⚠️ CRITICAL ALLERGIES</h3>
          {user.allergies.map((allergy, index) => (
            <p key={index} style={{ color: '#dc2626', fontWeight: 'bold' }}>• {allergy}</p>
          ))}
        </div>
      )}

      {user.conditions.length > 0 && (
        <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #fcd34d' }}>
          <h3 style={{ color: '#d97706', marginBottom: '15px' }}>🔍 Medical Conditions</h3>
          {user.conditions.map((condition, index) => (
            <p key={index} style={{ color: '#d97706' }}>• {condition}</p>
          ))}
        </div>
      )}

      {user.medications.length > 0 && (
        <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #60a5fa' }}>
          <h3 style={{ color: '#2563eb', marginBottom: '15px' }}>💊 Current Medications</h3>
          {user.medications.map((medication, index) => (
            <p key={index} style={{ color: '#2563eb' }}>• {medication}</p>
          ))}
        </div>
      )}

      {user.emergencyContacts.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #fecaca' }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>📞 Emergency Contacts</h2>
          {user.emergencyContacts.map((contact, index) => (
            <div key={index} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <p><strong>{contact.name}</strong> ({contact.relationship})</p>
              <a 
                href={`tel:${contact.phone}`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  marginTop: '10px'
                }}
              >
                📞 Call {contact.phone}
              </a>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ color: '#6b7280' }}>🛡️ Powered by MedGuard</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>No login required in emergencies</p>
      </div>
    </div>
  );
} 