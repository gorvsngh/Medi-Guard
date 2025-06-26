import { z } from 'zod';

// Blood type enum
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

// Phone number validation regex
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

// Emergency contact schema
export const emergencyContactSchema = z.object({
  name: z.string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name cannot exceed 100 characters')
    .trim(),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .transform(val => val.replace(/[\s\-\(\)]/g, '')), // Clean phone number
  relationship: z.string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship cannot exceed 50 characters')
    .trim(),
});

// User registration schema
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(254, 'Email cannot exceed 254 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User login schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required'),
});

// Medical profile schema
export const profileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  bloodType: z.enum(bloodTypes, {
    errorMap: () => ({ message: 'Please select a valid blood type' }),
  }),
  allergies: z.array(z.string().trim())
    .max(20, 'Cannot have more than 20 allergies')
    .default([])
    .transform(arr => arr.filter(item => item.length > 0)), // Remove empty strings
  conditions: z.array(z.string().trim())
    .max(20, 'Cannot have more than 20 conditions')
    .default([])
    .transform(arr => arr.filter(item => item.length > 0)),
  medications: z.array(z.string().trim())
    .max(30, 'Cannot have more than 30 medications')
    .default([])
    .transform(arr => arr.filter(item => item.length > 0)),
  emergencyContacts: z.array(emergencyContactSchema)
    .min(1, 'At least one emergency contact is required')
    .max(10, 'Cannot have more than 10 emergency contacts'),
});

// Location schema for emergency alerts
export const locationSchema = z.object({
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  address: z.string()
    .max(500, 'Address cannot exceed 500 characters')
    .optional(),
}).refine(
  (data) => {
    // Either both lat/lng are provided or neither, or address is provided
    const hasCoords = data.latitude !== undefined && data.longitude !== undefined;
    const hasPartialCoords = data.latitude !== undefined || data.longitude !== undefined;
    return hasCoords || data.address || !hasPartialCoords;
  },
  {
    message: 'Either provide both latitude and longitude, or an address, or neither',
  }
);

// Emergency alert schema
export const alertSchema = z.object({
  publicToken: z.string()
    .min(1, 'Public token is required')
    .length(64, 'Invalid public token format'), // 32 bytes = 64 hex chars
  location: locationSchema.optional(),
  customMessage: z.string()
    .max(500, 'Custom message cannot exceed 500 characters')
    .optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'New password must be at least 6 characters')
    .max(128, 'New password cannot exceed 128 characters'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

// Validation helper functions
export function validateEmail(email: string): boolean {
  try {
    z.string().email().parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePhoneNumber(phone: string): boolean {
  try {
    z.string().regex(phoneRegex).parse(phone.replace(/[\s\-\(\)]/g, ''));
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Basic XSS protection
    .slice(0, 1000); // Prevent extremely long inputs
}

// Type exports for TypeScript
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;
export type LocationData = z.infer<typeof locationSchema>;
export type AlertData = z.infer<typeof alertSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>; 