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
  results?: Array<{
    contact: string;
    phone: string;
    formattedPhone?: string;
    status?: string;
    sid?: string;
    error?: string;
  }>;
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
        // Format phone number to E.164 standard
        const formattedPhone = formatPhoneNumber(contact.phone);
        
        // Validate the formatted phone number
        if (!validatePhoneNumber(formattedPhone)) {
          let errorMsg = `Invalid phone number: ${contact.phone}`;
          
          // Provide more specific error for common issues
          if (formattedPhone.startsWith('+1') && formattedPhone.length === 12) {
            const areaCode = formattedPhone.substring(2, 5);
            if (['748', '749'].includes(areaCode)) {
              const suggestions = getValidAreaCodeSuggestions().slice(0, 3).join(', ');
              errorMsg += ` (Area code ${areaCode} is not assigned. Try: ${suggestions})`;
            } else if (areaCode[0] === '0' || areaCode[0] === '1') {
              errorMsg += ` (Area code cannot start with ${areaCode[0]})`;
            }
          } else if (formattedPhone.startsWith('+91') && formattedPhone.length === 13) {
            const mobileNumber = formattedPhone.substring(3);
            if (!['6', '7', '8', '9'].includes(mobileNumber[0])) {
              errorMsg += ` (Indian mobile numbers must start with 6, 7, 8, or 9)`;
            }
          }
          
          throw new Error(errorMsg);
        }

        const result = await client.messages.create({
          body: message,
          from: twilioNumber,
          to: formattedPhone,
        });

        results.push({
          contact: contact.name,
          phone: contact.phone,
          formattedPhone: formattedPhone,
          status: 'sent',
          sid: result.sid,
        });

        console.log(`✅ Alert sent to ${contact.name} (${contact.phone} -> ${formattedPhone})`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to send alert to ${contact.name} (${contact.phone}):`, errorMessage);
        errors.push({
          contact: contact.name,
          phone: contact.phone,
          error: errorMessage,
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
  } catch (error: unknown) {
    console.error('Unexpected error sending emergency alerts:', error);
    return {
      success: false,
      message: 'Unexpected error occurred while sending alerts.',
    };
  }
}

export function validatePhoneNumber(phone: string): boolean {
  // E.164 format validation: +[country code][number]
  // Must start with +, followed by 1-3 digit country code, then 4-14 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  
  // Remove all spaces, dashes, parentheses for validation
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!e164Regex.test(cleaned)) {
    return false;
  }
  
  // Additional validation for US numbers (+1 followed by 10 digits)
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    const areaCode = cleaned.substring(2, 5);
    
    // List of some invalid/unassigned area codes that should be rejected
    const invalidAreaCodes = ['748', '749', '000', '001', '911', '555'];
    
    if (invalidAreaCodes.includes(areaCode)) {
      return false;
    }
    
    // Basic area code format validation (first digit can't be 0 or 1)
    if (areaCode[0] === '0' || areaCode[0] === '1') {
      return false;
    }
  }
  
  // Additional validation for Indian numbers (+91 followed by 10 digits)
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    const mobileNumber = cleaned.substring(3);
    
    // Indian mobile numbers should start with 6, 7, 8, or 9
    if (!['6', '7', '8', '9'].includes(mobileNumber[0])) {
      return false;
    }
    
    // Should be exactly 10 digits
    if (mobileNumber.length !== 10) {
      return false;
    }
  }
  
  return true;
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d\+]/g, '');
  
  // Remove leading zeros if any
  cleaned = cleaned.replace(/^0+/, '');
  
  // Handle different cases
  if (cleaned.startsWith('+')) {
    // Already has country code
    return cleaned;
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    // Indian number with country code but no +
    return '+' + cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    // US number with country code but no +
    return '+' + cleaned;
  } else if (cleaned.length === 10 && (cleaned.startsWith('7') || cleaned.startsWith('8') || cleaned.startsWith('9'))) {
    // Indian mobile number without country code (starts with 7, 8, or 9)
    return '+91' + cleaned;
  } else if (cleaned.length === 10) {
    // US number without country code
    return '+1' + cleaned;
  } else if (cleaned.length > 10) {
    // International number without +
    return '+' + cleaned;
  } else {
    // For incomplete numbers, try to guess based on first digit
    if (cleaned.length > 0 && ['6', '7', '8', '9'].includes(cleaned[0])) {
      // Likely Indian number
      return '+91' + cleaned;
    } else {
      // Default to US for other cases
      return '+1' + cleaned;
    }
  }
}

export function getValidAreaCodeSuggestions(): string[] {
  return [
    '213', '310', '323', '424', '661', '747', '818', // Los Angeles area
    '415', '628', '650', // San Francisco area
    '212', '646', '917', '929', // New York area
    '202', // Washington DC
    '305', '786', // Miami area
    '312', '773', '872', // Chicago area
    '617', '857', // Boston area
    '214', '469', '972', // Dallas area
    '713', '281', '832', // Houston area
    '480', '602', '623', // Phoenix area
  ];
}

export function getValidIndianNumberSuggestions(): string[] {
  return [
    '+91 9876543210', // Standard Indian mobile
    '+91 8123456789', // Standard Indian mobile
    '+91 7890123456', // Standard Indian mobile
    '+91 6987654321', // Standard Indian mobile
  ];
}

export function checkPhoneNumber(phone: string): { 
  isValid: boolean; 
  formatted?: string; 
  error?: string; 
  suggestions?: string[]; 
} {
  try {
    const formatted = formatPhoneNumber(phone);
    const isValid = validatePhoneNumber(formatted);
    
    if (isValid) {
      return { isValid: true, formatted };
    }
    
    // Provide detailed error message
    let error = `Invalid phone number: ${phone}`;
    let suggestions: string[] = [];
    
    if (formatted.startsWith('+1') && formatted.length === 12) {
      const areaCode = formatted.substring(2, 5);
      if (['748', '749'].includes(areaCode)) {
        error = `Area code ${areaCode} is not assigned`;
        suggestions = getValidAreaCodeSuggestions().slice(0, 5);
      } else if (areaCode[0] === '0' || areaCode[0] === '1') {
        error = `Area code cannot start with ${areaCode[0]}`;
        suggestions = getValidAreaCodeSuggestions().slice(0, 5);
      }
    } else if (formatted.startsWith('+91') && formatted.length === 13) {
      const mobileNumber = formatted.substring(3);
      if (!['6', '7', '8', '9'].includes(mobileNumber[0])) {
        error = `Indian mobile numbers must start with 6, 7, 8, or 9`;
        suggestions = getValidIndianNumberSuggestions();
      }
    } else {
      // General suggestions for both US and Indian numbers
      suggestions = [
        ...getValidIndianNumberSuggestions().slice(0, 2),
        ...getValidAreaCodeSuggestions().slice(0, 3).map(code => `+1 ${code}12345678`)
      ];
    }
    
    return { isValid: false, error, suggestions };
  } catch {
    return { 
      isValid: false, 
      error: 'Invalid phone number format',
      suggestions: [
        ...getValidIndianNumberSuggestions().slice(0, 2),
        ...getValidAreaCodeSuggestions().slice(0, 3).map(code => `+1 ${code}12345678`)
      ]
    };
  }
}

export async function sendTestSMS(testNumber: string = '+15005550006'): Promise<{
  success: boolean;
  message: string;
  result?: {
    sid: string;
    status: string;
    to: string;
    from: string;
  };
}> {
  if (!client) {
    return {
      success: false,
      message: 'Twilio not configured.',
    };
  }

  if (!twilioNumber) {
    return {
      success: false,
      message: 'Twilio phone number not configured.',
    };
  }

  try {
    const result = await client.messages.create({
      body: '🧪 Test SMS from MedGuard - This is a test message to verify Twilio SMS functionality.',
      from: twilioNumber,
      to: testNumber,
    });

    console.log(`✅ Test SMS sent successfully to ${testNumber} (SID: ${result.sid})`);
    
    return {
      success: true,
      message: `Test SMS sent successfully to ${testNumber}`,
      result: {
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to send test SMS to ${testNumber}:`, errorMessage);
    return {
      success: false,
      message: `Failed to send test SMS: ${errorMessage}`,
    };
  }
} 