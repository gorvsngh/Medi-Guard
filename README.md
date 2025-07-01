# 🛡️ MedGuard - Emergency Health Platform

A production-ready full-stack emergency health platform that provides instant access to critical medical information through QR codes. Perfect for first responders, emergency situations, and peace of mind.

## 🚨 Overview

MedGuard allows users to create comprehensive medical profiles and generate QR codes that provide instant, no-login access to critical medical information in emergencies. The platform includes:

- **Medical Profile Management** - Blood type, allergies, conditions, medications, emergency contacts
- **QR Code Generation** - Unique, secure QR codes for instant emergency access
- **Public Emergency Pages** - Fast-loading, mobile-optimized emergency information display
- **SOS Alert System** - One-click emergency alerts with location sharing via SMS
- **Security & Privacy** - JWT authentication, rate limiting, and secure token-based access

## 📊 Data Flow Diagram

The following diagram illustrates how data flows through the MedGuard system, from user registration to emergency access:

```mermaid
graph TD
    A["👤 User Registration"] --> B["🔐 Authentication<br/>JWT Token"]
    B --> C["📝 Profile Creation<br/>Medical Information"]
    C --> D["🔒 Database Storage<br/>MongoDB"]
    D --> E["🔗 QR Code Generation<br/>Unique Token"]
    
    E --> F["📱 QR Code Display<br/>Print/Download"]
    F --> G["🚨 Emergency Scan<br/>Public Access"]
    
    G --> H["🌐 Public Emergency Page<br/>/public/[token]"]
    H --> I["📋 Medical Information<br/>Display"]
    
    I --> J{"🆘 Emergency Alert?"}
    J -->|Yes| K["📍 Get Location<br/>Browser API"]
    J -->|No| L["ℹ️ View Only Mode"]
    
    K --> M["📞 Send SMS Alert<br/>Twilio API"]
    M --> N["👥 Emergency Contacts<br/>Notification"]
    
    D --> O["🔄 Profile Updates<br/>Real-time Sync"]
    O --> E
    
    P["🛡️ Security Layer"] --> B
    P --> G
    P --> M
    
    Q["⚡ Rate Limiting"] --> P
    R["🔍 Input Validation"] --> P
    S["🍪 JWT Cookies"] --> P
```

### Data Flow Explanation

1. **User Registration & Authentication**: Users create accounts with secure JWT-based authentication
2. **Profile Management**: Medical information is stored securely in MongoDB
3. **QR Code Generation**: Each profile gets a unique, secure token for public access
4. **Emergency Access**: QR codes provide instant, no-login access to medical information
5. **Alert System**: Optional SOS alerts notify emergency contacts with location data
6. **Security Layer**: Multiple security measures protect all data flows

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **SMS/Alerts**: Twilio Messaging API
- **QR Codes**: qrcode library with SVG/PNG support
- **Security**: Rate limiting, input validation with Zod, CSRF protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB (local or MongoDB Atlas)
- Twilio account (for SMS alerts)

### Installation

1. **Clone and install dependencies**
```bash
git clone <your-repo-url>
cd medguard
npm install
```

2. **Environment Setup**
Create a `.env.local` file with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/medguard

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-here-at-least-32-characters-long

# Twilio Configuration for SMS alerts
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token  
TWILIO_PHONE_NUMBER=+1234567890

# Application Configuration
NODE_ENV=development
DOMAIN=http://localhost:3000
```

3. **Database Setup**
```bash
# Start MongoDB locally (if using local installation)
mongod

# Or use MongoDB Atlas cloud database
# Update MONGODB_URI with your Atlas connection string
```

4. **Run Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📱 Core Features

### 1. User Registration & Authentication
- Secure email/password registration
- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- Session management and automatic token refresh

### 2. Medical Profile Management
- Comprehensive medical information forms
- Blood type, allergies, chronic conditions, medications
- Multiple emergency contacts with relationships
- Form validation with real-time feedback
- Profile completeness tracking

### 3. QR Code Generation & Management
- Unique, secure QR codes for each user profile
- High-resolution PNG and SVG downloads
- Print-friendly emergency cards
- URL sharing and clipboard copying
- Mobile-optimized QR code scanning

### 4. Public Emergency Access
- **No-login emergency pages** at `/public/[token]`
- Instant access to critical medical information
- Mobile-first, high-contrast emergency UI
- Static generation for fast loading (ISR)
- SEO optimization and meta tags

### 5. Emergency Alert System
- **One-click SOS alerts** via Twilio SMS
- Automatic geolocation sharing (with fallback)
- Custom emergency messages
- Multiple contact notifications
- Location links via Google Maps
- Rate limiting to prevent abuse

### 6. Security & Privacy
- Token-based public access (64-character random tokens)
- Rate limiting on all critical endpoints
- Input validation and sanitization
- CSRF protection and security headers
- Password strength requirements
- Secure cookie configuration

## 🏗️ Project Structure

```
medguard/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── profile/              # Profile management
│   │   └── alert/                # Emergency alert system
│   ├── dashboard/                # User dashboard
│   ├── profile/                  # Profile management UI
│   ├── qr-code/                  # QR code display & download
│   ├── public/[token]/           # Public emergency pages
│   └── layout.tsx                # Root layout with providers
├── components/                   # React components
│   └── EmergencyPage.tsx         # Emergency information display
├── hooks/                        # Custom React hooks
│   ├── useAuth.tsx               # Authentication context
│   ├── useLocation.ts            # Geolocation handling
│   └── useQRCode.ts              # QR code generation
├── lib/                          # Utility libraries
│   ├── auth.ts                   # JWT utilities
│   ├── db.ts                     # MongoDB connection
│   ├── rateLimiter.ts            # Rate limiting
│   ├── twilio.ts                 # SMS integration
│   └── validations.ts            # Zod schemas
├── models/                       # Database models
│   └── User.ts                   # User/profile schema
└── middleware.ts                 # Route protection & security
```

## 🚨 Emergency Usage Flow

1. **Profile Setup**: User creates account and completes medical profile
2. **QR Code Generation**: System generates unique QR code linked to secure token
3. **Physical QR Code**: User prints/saves QR code for wallet, phone case, etc.
4. **Emergency Scan**: Anyone can scan QR code to access medical info
5. **Instant Information**: Emergency page loads with critical medical data
6. **SOS Alert**: Optional one-click alert sends SMS to emergency contacts with location

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with 24-hour expiration
- HTTP-only, secure cookies (production)
- Protected routes via middleware
- Password hashing with bcrypt (salt rounds: 12)

### Rate Limiting
- **Authentication**: 5 attempts per 15 minutes
- **Emergency Alerts**: 10 alerts per 15 minutes  
- **Public Pages**: 60 requests per minute
- **General API**: 100 requests per 15 minutes

### Data Protection
- Input validation with Zod schemas
- XSS protection via sanitization
- CSRF protection via SameSite cookies
- Secure headers (CSP, HSTS, etc.)
- MongoDB injection prevention

### Privacy Controls
- Public tokens are cryptographically random (256-bit)
- Medical data accessible only via secure token
- No personal information in URLs or logs
- Optional profile data (user controls what to share)

## 📲 Mobile Optimization

- **Mobile-first design** with Tailwind CSS breakpoints
- **Touch-friendly interfaces** with large tap targets
- **Offline support** for emergency pages (after initial load)
- **Progressive Web App** features (manifest.json)
- **High contrast emergency UI** for accessibility
- **Fast loading** via static generation and image optimization

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medguard
JWT_SECRET=your-production-jwt-secret-32-chars-minimum
TWILIO_ACCOUNT_SID=your-production-twilio-sid
TWILIO_AUTH_TOKEN=your-production-twilio-token
TWILIO_PHONE_NUMBER=your-verified-twilio-number
DOMAIN=https://yourdomain.com
```

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Enable MongoDB integration if using Atlas
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Server Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "medguard" -- start
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Test database connection
node test-db-connection.js

# Test API endpoints
curl http://localhost:3000/api/auth/me
```

## 📊 Performance Optimization

- **Static Generation** for emergency pages (ISR with 1-hour revalidation)
- **Image Optimization** via Next.js built-in optimizer
- **Code Splitting** with dynamic imports
- **Bundle Analysis** with @next/bundle-analyzer
- **Caching Strategy** for MongoDB connections
- **Compression** via gzip/brotli

## 🚨 Emergency Response Integration

### For First Responders
- Instant access via QR code scan (no app installation required)
- Critical medical information displayed prominently
- Emergency contact numbers with one-tap calling
- Location sharing for faster response times

### For Healthcare Providers
- Standardized medical information format
- Allergy warnings prominently displayed
- Current medications and dosages
- Medical conditions and history
- Emergency contact relationships

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For emergency medical situations, always call your local emergency number (911 in the US).

For technical support:
- Create an issue in the GitHub repository
- Check the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check MongoDB status
systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Test connection
node test-db-connection.js
```

**Twilio SMS Failures**
- Verify account SID and auth token
- Check phone number verification
- Ensure sufficient Twilio credits
- Verify recipient phone numbers are in E.164 format

**QR Code Generation Issues**
- Check if the domain is properly set in environment variables
- Verify user has completed profile setup
- Test QR code URL manually in browser

**Authentication Problems**
- Clear browser cookies and local storage
- Check JWT secret is consistent across restarts
- Verify token expiration times

---

**🛡️ MedGuard - Saving lives through instant access to critical medical information**
