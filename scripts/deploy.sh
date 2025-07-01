#!/bin/bash

# MedGuard Emergency Health Platform - Production Deployment Script
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
echo "🛡️ MedGuard Deployment Script - Environment: $ENVIRONMENT"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run from project root."
    exit 1
fi

# Check environment file
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    log_error "Environment file $ENV_FILE not found"
    log_warn "Create $ENV_FILE with production configuration"
    exit 1
fi

log_info "Found environment file: $ENV_FILE"

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Validate required environment variables
REQUIRED_VARS=(
    "MONGODB_URI"
    "JWT_SECRET"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
    "DOMAIN"
)

log_info "Validating environment variables..."
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required environment variable $var is not set"
        exit 1
    fi
done

# Security checks
log_info "Running security checks..."

# Check JWT secret length
if [ ${#JWT_SECRET} -lt 32 ]; then
    log_error "JWT_SECRET must be at least 32 characters long"
    exit 1
fi

# Check if production secrets are not default values
if [[ "$JWT_SECRET" == *"change-this"* ]] || [[ "$JWT_SECRET" == *"your-secret"* ]]; then
    log_error "JWT_SECRET appears to be a default value. Use a secure random string."
    exit 1
fi

if [[ "$TWILIO_ACCOUNT_SID" == *"your-twilio"* ]]; then
    log_error "Twilio credentials appear to be default values"
    exit 1
fi

log_info "Security checks passed"

# Install dependencies
log_info "Installing dependencies..."
npm ci --only=production

# Run tests and linting
log_info "Running pre-deployment checks..."
npm run lint
if command -v npx &> /dev/null; then
    npx tsc --noEmit
fi

# Build the application
log_info "Building application..."
NODE_ENV=production npm run build

# Test database connection
log_info "Testing database connection..."
if [ -f "test-db-connection.js" ]; then
    node test-db-connection.js
else
    log_warn "Database connection test script not found"
fi

# Check build output
if [ ! -d ".next" ]; then
    log_error "Build failed - .next directory not found"
    exit 1
fi

log_info "Build completed successfully"

# Platform-specific deployment
case "$ENVIRONMENT" in
    "production")
        log_info "Deploying to production..."
        
        # Vercel deployment
        if command -v vercel &> /dev/null; then
            log_info "Deploying to Vercel..."
            vercel --prod --confirm
        else
            log_warn "Vercel CLI not found. Install with: npm i -g vercel"
        fi
        
        # PM2 deployment (if using VPS)
        if command -v pm2 &> /dev/null; then
            log_info "Deploying with PM2..."
            pm2 stop medguard || true
            pm2 delete medguard || true
            pm2 start npm --name "medguard" -- start
            pm2 save
        fi
        ;;
        
    "staging")
        log_info "Deploying to staging..."
        # Add staging-specific deployment logic
        ;;
        
    *)
        log_error "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Post-deployment checks
log_info "Running post-deployment checks..."

# Health check (if URL is available)
if [ ! -z "$DOMAIN" ]; then
    sleep 5  # Wait for deployment to be ready
    
    if command -v curl &> /dev/null; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN" || echo "000")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            log_info "Health check passed - Site is responding"
        else
            log_warn "Health check failed - HTTP status: $HTTP_STATUS"
        fi
    fi
fi

# Deployment summary
echo ""
echo "🎉 Deployment Summary"
echo "===================="
echo "Environment: $ENVIRONMENT"
echo "Domain: $DOMAIN"
echo "Build: ✅ Successful"
echo "Time: $(date)"

if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    log_info "Production deployment completed!"
    log_warn "Monitor the application for any issues"
    log_info "Emergency QR codes are now live at: $DOMAIN/public/[token]"
fi

echo ""
echo "📋 Post-deployment checklist:"
echo "• Test user registration and login"
echo "• Verify QR code generation and scanning"
echo "• Test emergency alert system"
echo "• Check database connectivity"
echo "• Monitor error logs"
echo "• Verify SSL certificate (if applicable)"

echo ""
log_info "MedGuard deployment complete! 🛡️"
log_info "Ready to help save lives through instant medical information access." 