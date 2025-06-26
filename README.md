# 🛡️ MedGuard - Emergency Health Platform

A production-ready full-stack web application that serves as an emergency health platform. First responders or bystanders can instantly access a patient's critical medical information by scanning a QR code and trigger one-click SOS alerts to emergency contacts.

## 🚨 Features

### Core Functionality
- **QR Code Emergency Access**: Instant access to medical information via QR code scanning
- **Medical Profile Management**: Comprehensive medical profiles including blood type, allergies, conditions, medications
- **Emergency Contacts**: Multiple emergency contacts with one-click calling
- **SOS Alerts**: One-click emergency alerts with geolocation sent via SMS
- **Mobile-First Design**: Optimized for emergency situations on mobile devices
- **No-Login Emergency Access**: Critical information accessible without authentication

### Security & Performance
- **JWT Authentication**: Secure authentication with HTTP-only cookies
- **Rate Limiting**: Protection against abuse and brute force attacks
- **Input Validation**: Comprehensive validation using Zod schemas
- **XSS Protection**: Input sanitization and secure output rendering
- **Fast Loading**: Static generation for emergency pages (ISR)
- **Secure Tokens**: Unique public tokens for emergency access

### Integrations
- **MongoDB**: Scalable database with Mongoose ODM
- **Twilio SMS**: Emergency alert system with SMS/WhatsApp
- **Geolocation**: Automatic location sharing in emergencies
- **QR Code Generation**: High-quality QR codes with print/download options

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: App Router with React Server Components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Mobile-first responsive design
- **React Hooks**: Custom hooks for auth, location, QR codes

### Backend
- **Next.js API Routes**: RESTful API endpoints
- **MongoDB**: Document database with indexes
- **Mongoose**: ODM with validation and middleware
- **JWT**: Secure authentication
- **bcrypt**: Password hashing

### External Services
- **Twilio**: SMS/WhatsApp messaging
- **Geolocation API**: Browser-based location services

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Twilio account (for SMS alerts)

### 1. Clone and Install

```bash
git clone <repository-url>
cd medguard
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Atlas Connection String (required)
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/medguard?retryWrites=true&w=majority

# JWT Secret for token signing (required)
# Generate a secure random string for production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Twilio SMS Configuration (required for emergency alerts)
# Get these from your Twilio Console at https://console.twilio.com/
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Application Domain (optional, defaults to localhost)
DOMAIN=http://localhost:3000

# Environment
NODE_ENV=development
```

**⚠️ Important**: The application requires these environment variables to function. Make sure to:
1. Set up a MongoDB Atlas cluster and get your connection string
2. Create a Twilio account for SMS functionality
3. Generate a secure JWT secret for production

### 3. Database Setup

Ensure MongoDB is running locally or configure MongoDB Atlas connection string in `.env.local`.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 User Flows

### 1. Profile Setup
1. User registers/logs in
2. Fills out medical profile form
3. Receives QR code for printing/saving

### 2. Emergency Access
1. Bystander scans QR code
2. Views patient's medical information
3. Can call 911 or send SOS alerts
4. Emergency contacts receive SMS with location

### 3. SOS Alert Process
1. Click "Send SOS Alert" button
2. App requests geolocation permission
3. SMS sent to all emergency contacts
4. Message includes patient name, location link, and emergency details

## 🔧 Project Structure

```
medguard/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── profile/              # Profile management
│   │   └── alert/                # Emergency alerts
│   ├── public/[token]/           # Public emergency pages
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── dashboard/                # User dashboard (create this)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   └── EmergencyPage.tsx         # Emergency info display
├── hooks/                        # Custom React hooks
│   ├── useAuth.tsx              # Authentication hook
│   ├── useLocation.ts           # Geolocation hook
│   └── useQRCode.ts             # QR code generation
├── lib/                         # Utility libraries
│   ├── auth.ts                  # JWT utilities
│   ├── db.ts                    # MongoDB connection
│   ├── rateLimiter.ts           # Rate limiting
│   ├── twilio.ts                # SMS service
│   └── validations.ts           # Zod schemas
├── models/                      # Database models
│   └── User.ts                  # User model
└── middleware/                  # Next.js middleware
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Emergency Alerts
- `POST /api/alert` - Send emergency alert

### Public Access
- `GET /public/[token]` - Emergency page (static)

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set:

```env
NODE_ENV=production
DOMAIN=https://your-domain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-production-secret
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Other Platforms
- **Netlify**: Use `npm run build` and deploy `out/` folder
- **Docker**: Create Dockerfile with Node.js runtime
- **VPS**: Use PM2 for process management

## 🧪 Testing Setup

Create test users and profiles:

```bash
# Run the development server
npm run dev

# Create test accounts via the registration page
# Test the QR code scanning flow
# Verify SMS alerts (requires Twilio configuration)
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Strong JWT secrets (use `openssl rand -base64 32`)
- [ ] HTTPS enabled with secure cookies
- [ ] Rate limiting configured for all endpoints
- [ ] Input validation on all forms
- [ ] MongoDB indexes for performance
- [ ] CORS properly configured
- [ ] Content Security Policy headers
- [ ] Regular security updates

### Privacy & Compliance
- Medical information is stored securely
- Public tokens prevent profile enumeration
- Rate limiting prevents abuse
- No sensitive data in logs
- Consider HIPAA compliance requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For emergency situations, this platform provides:
- Instant access to medical information
- Direct calling to emergency services
- Automated alert system for emergency contacts
- Geolocation sharing for faster response

For technical support or questions about the platform, please create an issue in this repository.

---

**⚠️ Important**: This platform is designed to assist in emergencies but should not replace professional medical advice or emergency services. Always call 911 or your local emergency number in life-threatening situations.
