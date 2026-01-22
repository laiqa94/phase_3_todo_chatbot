'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getCurrentUser } from '@/lib/api';

const ApiTestPage = () => {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: Record<string, unknown> | unknown[];
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      // Test getting current user
      const userData = await getCurrentUser();
      setTestResult({
        success: true,
        message: 'Successfully fetched user data',
        data: userData as Record<string, unknown> | unknown[]
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to fetch user data',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const testChatApi = async () => {
    setLoading(true);
    try {
      // Test chat API with a simple message
      const response = await apiFetch('/chat/1', {
        method: 'POST',
        body: {
          message: 'Hello, are you working?',
        },
      });

      setTestResult({
        success: true,
        message: 'Successfully sent chat message',
        data: response as Record<string, unknown> | unknown[]
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to send chat message',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>

      <div className="space-y-4">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Test User API
        </button>

        <button
          onClick={testChatApi}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 ml-2"
        >
          Test Chat API
        </button>

        {loading && <p>Loading...</p>}

        {testResult && (
          <div className={`p-4 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="font-bold">{testResult.message}</h3>
            {testResult.data && (
              <pre className="mt-2 text-sm overflow-auto">
                {typeof testResult.data === 'object' && testResult.data !== null
                  ? JSON.stringify(testResult.data, null, 2)
                  : String(testResult.data)}
              </pre>
            )}
            {testResult.error && <p className="mt-2"><strong>Error:</strong> {testResult.error}</p>}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <p><strong>Access Token:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('access_token') ? 'Present' : 'Missing') : 'Missing'}</p>
        <p><strong>User ID:</strong> {typeof window !== 'undefined' ? String(localStorage.getItem('user_id') || 'Missing') : 'Missing'}</p>
        <p><strong>API Base URL:</strong> {String(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'Not set')}</p>
      </div>
    </div>
  );
};

export default ApiTestPage;