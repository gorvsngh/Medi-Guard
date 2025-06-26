import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioNumber) {
  console.warn('Twilio credentials not configured. SMS alerts will not work.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface LocationData {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface AlertData {
  patientName: string;
  location?: LocationData;
  emergencyContacts: EmergencyContact[];
  customMessage?: string;
}

export async function sendEmergencyAlert(alertData: AlertData): Promise<{
  success: boolean;
  message: string;
  results?: any[];
}> {
  if (!client) {
    return {
      success: false,
      message: 'Twilio not configured. Cannot send SMS alerts.',
    };
  }

  if (!twilioNumber) {
    return {
      success: false,
      message: 'Twilio phone number not configured.',
    };
  }

  const { patientName, location, emergencyContacts, customMessage } = alertData;

  // Build the alert message
  let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
  message += `${patientName} needs immediate help!\n\n`;
  
  if (customMessage) {
    message += `Message: ${customMessage}\n\n`;
  }

  if (location && location.latitude && location.longitude) {
    message += `📍 Location: https://maps.google.com/?q=${location.latitude},${location.longitude}\n\n`;
  } else if (location && location.address) {
    message += `📍 Location: ${location.address}\n\n`;
  }

  message += `This is an automated emergency alert from MedGuard. Please respond immediately.`;

  try {
    const results = [];
    const errors = [];

    // Send SMS to all emergency contacts
    for (const contact of emergencyContacts) {
      try {
        const result = await client.messages.create({
          body: message,
          from: twilioNumber,
          to: contact.phone,
        });

        results.push({
          contact: contact.name,
          phone: contact.phone,
          status: 'sent',
          sid: result.sid,
        });

        console.log(`✅ Alert sent to ${contact.name} (${contact.phone})`);
      } catch (error: any) {
        console.error(`❌ Failed to send alert to ${contact.name} (${contact.phone}):`, error.message);
        errors.push({
          contact: contact.name,
          phone: contact.phone,
          error: error.message,
        });
      }
    }

    const totalContacts = emergencyContacts.length;
    const successfulSends = results.length;
    const failedSends = errors.length;

    if (successfulSends === 0) {
      return {
        success: false,
        message: `Failed to send alerts to all ${totalContacts} contacts.`,
        results: [...results, ...errors],
      };
    }

    if (failedSends > 0) {
      return {
        success: true,
        message: `Alerts sent to ${successfulSends}/${totalContacts} contacts. ${failedSends} failed.`,
        results: [...results, ...errors],
      };
    }

    return {
      success: true,
      message: `Emergency alerts successfully sent to all ${totalContacts} contacts.`,
      results,
    };
  } catch (error: any) {
    console.error('Unexpected error sending emergency alerts:', error);
    return {
      success: false,
      message: 'Unexpected error occurred while sending alerts.',
    };
  }
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic international phone number validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d\+]/g, '');
  
  // Ensure it starts with + for international format
  if (!cleaned.startsWith('+')) {
    // Assume US number if no country code
    cleaned = '+1' + cleaned;
  }
  
  return cleaned;
} 