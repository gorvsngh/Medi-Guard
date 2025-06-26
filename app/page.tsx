import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-600">🛡️ MedGuard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-red-600">Emergency</span> Medical Information
            <br />
            <span className="text-orange-600">Instantly</span> Accessible
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            MedGuard provides instant access to critical medical information through QR codes. 
            Perfect for first responders, emergencies, and peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Create Your Emergency Profile
            </Link>
            <Link
              href="#how-it-works"
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              How It Works
            </Link>
          </div>

          {/* Demo QR Code */}
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 rounded-lg flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Your Emergency QR Code</h3>
              <p className="text-sm text-gray-600">
                Anyone can scan this to access your medical info in emergencies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How MedGuard Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and life-saving in emergencies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Create Profile</h3>
              <p className="text-gray-600">
                Add your medical information: blood type, allergies, conditions, medications, and emergency contacts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Get QR Code</h3>
              <p className="text-gray-600">
                Receive a unique QR code that links to your emergency medical information. Print it or save it on your phone.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Emergency Access</h3>
              <p className="text-gray-600">
                In emergencies, anyone can scan your QR code to see your medical info and send alerts to your contacts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MedGuard?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Instant Access</h3>
              <p className="text-gray-600">No login required for emergency access. Critical information available in seconds.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data is encrypted and only accessible via your unique QR code.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">Mobile-First</h3>
              <p className="text-gray-600">Optimized for mobile devices and works offline after initial load.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🚑</div>
              <h3 className="text-lg font-semibold mb-2">Emergency Alerts</h3>
              <p className="text-gray-600">One-click SOS alerts sent to all your emergency contacts with location.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-lg font-semibold mb-2">Location Sharing</h3>
              <p className="text-gray-600">Automatic location sharing in emergency alerts for faster response.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Simple setup process and intuitive interface for all age groups.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your Emergency Profile?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of users who trust MedGuard for emergency preparedness.
          </p>
          <Link
            href="/register"
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
          >
            Get Started - It's Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">🛡️ MedGuard</div>
            <p className="text-gray-400 mb-6">
              Emergency Health Platform - Saving lives through instant access to critical medical information
            </p>
            <div className="text-sm text-gray-500">
              © 2024 MedGuard. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
