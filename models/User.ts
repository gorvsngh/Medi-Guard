import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  publicToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  generatePublicToken(): string;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    bloodType: {
      type: String,
      required: false, // Made optional for initial registration
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: null,
    },
    allergies: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.length <= 20;
        },
        message: 'Cannot have more than 20 allergies',
      },
    },
    conditions: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.length <= 20;
        },
        message: 'Cannot have more than 20 conditions',
      },
    },
    medications: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.length <= 30;
        },
        message: 'Cannot have more than 30 medications',
      },
    },
    emergencyContacts: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Contact name cannot exceed 100 characters'],
          },
          phone: {
            type: String,
            required: true,
            match: [
              /^[\+]?[1-9][\d]{0,15}$/,
              'Please enter a valid phone number',
            ],
          },
          relationship: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, 'Relationship cannot exceed 50 characters'],
          },
        },
      ],
      default: [],
      validate: {
        validator: function (arr: any[]) {
          return arr.length <= 10;
        },
        message: 'Cannot have more than 10 emergency contacts',
      },
    },
    publicToken: {
      type: String,
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ publicToken: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Pre-save middleware to generate public token
UserSchema.pre('save', function (next) {
  if (!this.publicToken) {
    this.publicToken = this.generatePublicToken();
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// Method to generate public token
UserSchema.methods.generatePublicToken = function (): string {
  return randomBytes(32).toString('hex');
};

// Ensure model is not re-compiled
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 