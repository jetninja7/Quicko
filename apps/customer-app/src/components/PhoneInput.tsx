'use client';

import { useState } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, error, disabled }: PhoneInputProps) {
  const [display, setDisplay] = useState(formatPhoneNumber(value.replace('+1', '')));

  function formatPhoneNumber(input: string): string {
    const digits = input.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, 10);

    setDisplay(formatPhoneNumber(digits));

    if (digits.length === 10) {
      onChange(`+1${digits}`);
    } else {
      onChange('');
    }
  }

  return (
    <div className="w-full">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
          +1
        </span>
        <input
          type="tel"
          value={display}
          onChange={handleChange}
          disabled={disabled}
          placeholder="(555) 123-4567"
          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
