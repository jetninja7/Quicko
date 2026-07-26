'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length !== 12) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  }

  async function handleVerifyOtp(code: string) {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);

        if (data.data.user.role === 'DELIVERY_DRIVER') {
          router.push('/');
        } else {
          setError('This account is not registered as a delivery driver');
          localStorage.removeItem('token');
        }
      } else {
        setError(data.error || 'Invalid code');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full mb-4">
            <span className="text-4xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quicko Driver</h1>
          <p className="text-blue-100">Delivery Management Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Driver Login</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(digits ? `+1${digits}` : '');
                  }}
                  placeholder="(555) 123-4567"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !phoneNumber}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Code'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  💡 Use code <code className="font-mono bg-blue-100 px-1">000000</code> for testing
                </p>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Code</h2>
              <p className="text-gray-600 mb-6">
                Sent to {phoneNumber.replace('+1', '+1 ')}
              </p>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <button
                onClick={() => setStep('phone')}
                className="w-full text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Change phone number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
