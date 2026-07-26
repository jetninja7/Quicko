'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';
  const setUser = useAuthStore((state) => state.setUser);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!phoneNumber) {
      router.push('/auth/login');
    }
  }, [phoneNumber, router]);

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    if (newCode.every((digit) => digit !== '')) {
      handleSubmit(newCode.join(''));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  }

  async function handleSubmit(otp: string) {
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.verifyOtp(phoneNumber, otp);

      if (response.success) {
        setUser(response.data.user);
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await apiClient.sendOtp(phoneNumber);
      alert('Code sent!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter Verification Code</h1>
          <p className="text-gray-600">
            We sent a code to {phoneNumber.replace('+1', '+1 ')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-100"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-600 mb-4">
              Verifying...
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-primary-600 font-medium hover:text-primary-700 disabled:text-gray-400"
            >
              Didn't receive code? Resend
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              💡 <strong>Development tip:</strong> Use code <code className="font-mono bg-blue-100 px-1">000000</code> to bypass verification
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full mt-4 text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Change phone number
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
