'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testNumber, setTestNumber] = useState(''); // Empty by default for user to enter their verified number

  const testSMS = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testNumber: testNumber,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test Twilio SMS</h1>
        
        {/* Trial Account Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">📋 Twilio Trial Account Limitations</h2>
          <div className="text-blue-700 space-y-2">
            <p>• <strong>Trial accounts</strong> can only send SMS to <strong>verified numbers</strong></p>
            <p>• Your Twilio number: <code className="bg-blue-100 px-2 py-1 rounded">+15855132879</code></p>
            <p>• To test, you need to verify a phone number first</p>
          </div>
        </div>

        {/* How to Verify */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔐 How to Verify Your Phone Number</h3>
          <ol className="text-yellow-700 space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified" target="_blank" className="text-blue-600 underline">Twilio Console → Verified Caller IDs</a></li>
            <li>Click <strong>"Add a new Caller ID"</strong></li>
            <li>Enter your phone number (Indian: +91xxxxxxxxxx)</li>
            <li>Twilio will call/SMS you with a verification code</li>
            <li>Enter the code to verify</li>
            <li>Now you can test SMS to that verified number!</li>
          </ol>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test SMS Delivery</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Verified Phone Number:
              </label>
              <input
                type="text"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91xxxxxxxxxx (your verified Indian number)"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Only verified numbers work with trial accounts. Verify at console.twilio.com first.
              </p>
            </div>
            
            <button
              onClick={testSMS}
              disabled={loading || !testNumber.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : '📤 Send Test SMS'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`rounded-lg p-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? '✅ Success' : '❌ Error'}
            </h3>
            
            <p className={`mb-4 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
            
            {result.result && (
              <div className="bg-white rounded p-4 text-sm">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}
            
            {result.error && (
              <div className="bg-white rounded p-4 text-sm text-red-600">
                <strong>Error Details:</strong> {result.error}
              </div>
            )}
          </div>
        )}

        {/* Upgrade Options */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">🚀 Upgrade to Remove Limitations</h3>
          <div className="text-green-700 space-y-2">
            <p><strong>Trial Account:</strong> Only verified numbers</p>
            <p><strong>Paid Account:</strong> Send to any number worldwide</p>
            <p><strong>Cost:</strong> Very low (₹1-2 per SMS to India)</p>
            <p>
              <a 
                href="https://console.twilio.com/billing" 
                target="_blank" 
                className="text-blue-600 underline font-medium"
              >
                Upgrade Account →
              </a>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Common Error Codes</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>21211:</strong> Invalid phone number (trial account - unverified)</p>
            <p><strong>30003:</strong> Unreachable destination handset</p>
            <p><strong>30004:</strong> Message blocked (often India DND registry)</p>
            <p><strong>30005:</strong> Unknown destination handset</p>
            <p><strong>30008:</strong> Unknown carrier error</p>
            <p><strong>30044:</strong> India-specific delivery failure (carrier filtering)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 