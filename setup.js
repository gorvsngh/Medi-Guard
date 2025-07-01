#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛡️ MedGuard Emergency Health Platform Setup');
console.log('=========================================\n');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = 18;
const currentVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

if (currentVersion < requiredVersion) {
  console.error(`❌ Node.js ${requiredVersion}+ required. Current version: ${nodeVersion}`);
  process.exit(1);
}
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Are you in the correct directory?');
  process.exit(1);
}
console.log('✅ package.json found');

// Check for environment file
const envExists = fs.existsSync('.env.local');
if (!envExists) {
  console.warn('⚠️  .env.local not found');
  
  if (fs.existsSync('.env.example')) {
    console.log('📋 Found .env.example - copying to .env.local...');
    try {
      fs.copyFileSync('.env.example', '.env.local');
      console.log('✅ Created .env.local from .env.example');
      console.log('🔧 Please edit .env.local with your configuration');
    } catch (error) {
      console.error('❌ Failed to copy .env.example:', error.message);
    }
  } else {
    console.log('📋 Creating basic .env.local file...');
    const basicEnv = `# MedGuard Environment Configuration
MONGODB_URI=mongodb://localhost:27017/medguard
JWT_SECRET=change-this-to-a-secure-random-string-32-chars-minimum
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
DOMAIN=http://localhost:3000
NODE_ENV=development
`;
    
    try {
      fs.writeFileSync('.env.local', basicEnv);
      console.log('✅ Created .env.local with basic configuration');
      console.log('🔧 Please edit .env.local with your actual values');
    } catch (error) {
      console.error('❌ Failed to create .env.local:', error.message);
    }
  }
} else {
  console.log('✅ .env.local found');
}

// Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'twilio',
    'qrcode',
    'zod',
    'tailwindcss'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    console.warn(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('Run: npm install');
  } else {
    console.log('✅ All required dependencies found');
  }
  
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    console.log('Please run: npm install');
  }
} else {
  console.log('✅ node_modules found');
}

// Environment validation
console.log('\n🔧 Environment Configuration Check:');

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const envVars = {
    'MONGODB_URI': envContent.includes('MONGODB_URI=') && !envContent.includes('MONGODB_URI=mongodb://localhost:27017/medguard'),
    'JWT_SECRET': envContent.includes('JWT_SECRET=') && !envContent.includes('change-this-to'),
    'TWILIO_ACCOUNT_SID': envContent.includes('TWILIO_ACCOUNT_SID=') && !envContent.includes('your-twilio-account'),
    'TWILIO_AUTH_TOKEN': envContent.includes('TWILIO_AUTH_TOKEN=') && !envContent.includes('your-twilio-auth'),
    'TWILIO_PHONE_NUMBER': envContent.includes('TWILIO_PHONE_NUMBER=') && !envContent.includes('+1234567890'),
  };
  
  Object.entries(envVars).forEach(([key, configured]) => {
    if (configured) {
      console.log(`✅ ${key} configured`);
    } else {
      console.log(`⚠️  ${key} needs configuration`);
    }
  });
}

// Database setup check
console.log('\n🗄️  Database Setup:');
console.log('1. Make sure MongoDB is installed and running');
console.log('2. Or configure MongoDB Atlas connection string');
console.log('3. The application will create the database automatically');

// Twilio setup instructions
console.log('\n📱 Twilio Setup (for SMS alerts):');
console.log('1. Create account at https://www.twilio.com/');
console.log('2. Get Account SID and Auth Token from Console');
console.log('3. Buy/verify a phone number for sending SMS');
console.log('4. Update .env.local with your credentials');

// Security recommendations
console.log('\n🔒 Security Recommendations:');
console.log('1. Generate a strong JWT_SECRET (32+ characters)');
console.log('2. Use HTTPS in production');
console.log('3. Set up proper CORS configuration');
console.log('4. Enable rate limiting');

// Next steps
console.log('\n🚀 Next Steps:');
console.log('1. Edit .env.local with your configuration');
console.log('2. Run: npm run dev');
console.log('3. Visit: http://localhost:3000');
console.log('4. Create your first user account');
console.log('5. Set up your medical profile');
console.log('6. Generate your emergency QR code');

console.log('\n🆘 Emergency Features:');
console.log('• QR codes provide instant access to medical info');
console.log('• No login required for emergency access');
console.log('• One-click SOS alerts with location');
console.log('• Mobile-optimized emergency interface');

console.log('\n📚 Documentation:');
console.log('• README.md - Complete setup and usage guide');
console.log('• /api endpoints - RESTful API documentation');
console.log('• Components - Reusable UI components');

console.log('\n✨ Setup completed! Ready to save lives with MedGuard.');
console.log('🛡️ Remember: This is for emergency assistance, always call 911 for immediate help.\n');

// Check if we can run a test build
console.log('🧪 Testing build configuration...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('✅ Linting passed');
} catch (error) {
  console.warn('⚠️  Linting issues detected (run: npm run lint for details)');
}

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation check passed');
} catch (error) {
  console.warn('⚠️  TypeScript issues detected (run: npx tsc --noEmit for details)');
}

console.log('\n🎉 MedGuard setup complete!');
console.log('Run "npm run dev" to start the development server.'); 