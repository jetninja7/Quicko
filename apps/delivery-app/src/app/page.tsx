'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverHomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Quicko Driver</h1>
          <p className="text-blue-100 mt-1">Delivery Management</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/available')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Orders</h2>
            <p className="text-gray-600">
              View and accept orders waiting for pickup
            </p>
          </button>

          <button
            onClick={() => router.push('/deliveries')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Deliveries</h2>
            <p className="text-gray-600">
              Manage your active deliveries
            </p>
          </button>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="w-full px-4 py-3 text-left border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <span className="text-red-600 font-medium">🚪 Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
