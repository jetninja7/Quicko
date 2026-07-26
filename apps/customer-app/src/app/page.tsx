'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loadUser, logout } = useAuthStore();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  function handleGetStarted() {
    router.push('/auth/login');
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {isAuthenticated && user && (
          <div className="flex justify-end mb-4">
            <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.firstName || 'User'}</p>
                <p className="text-gray-500">{user.phoneNumber}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <div className="text-center py-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Quicko
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Groceries & essentials delivered in 10-30 minutes
          </p>

          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold shadow-lg">
                ✅ You're logged in as {user.phoneNumber}
              </div>
              <p className="text-gray-600">
                Product catalog coming soon!
              </p>
            </div>
          ) : (
            <button
              onClick={handleGetStarted}
              className="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
