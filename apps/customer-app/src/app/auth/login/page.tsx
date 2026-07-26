'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneInput } from '@/components/PhoneInput';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length !== 12) {
      setError('Please enter a valid US phone number');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.sendOtp(phoneNumber);
      router.push(`/auth/verify?phone=${encodeURIComponent(phoneNumber)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quicko</h1>
          <p className="text-gray-600">Enter your phone number to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                error={error}
                disabled={isLoading}
              />
              <p className="mt-2 text-xs text-gray-500">
                We'll send you a verification code
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
