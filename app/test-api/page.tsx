'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Making fetch request to /api/auth/login...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'testpass' 
        }),
        credentials: 'include',
      });

      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      setResult(`Status: ${response.status}, Data: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAbsoluteURL = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Making fetch request to absolute URL...');
      
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'testpass' 
        }),
        credentials: 'include',
      });

      console.log('Response received:', response);
      
      const data = await response.json();
      console.log('Response data:', data);

      setResult(`Status: ${response.status}, Data: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test API (Relative URL)'}
          </button>

          <button
            onClick={testAbsoluteURL}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 ml-4"
          >
            {loading ? 'Testing...' : 'Test API (Absolute URL)'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-white border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <p className="text-sm">
            1. Open browser dev tools (F12)<br/>
            2. Go to Console tab<br/>
            3. Click the test buttons<br/>
            4. Check console for detailed error messages
          </p>
        </div>
      </div>
    </div>
  );
} 