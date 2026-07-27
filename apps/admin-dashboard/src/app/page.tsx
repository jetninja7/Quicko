'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeDeliveries: number;
  totalCustomers: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, [router]);

  async function fetchStats() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quicko Admin</h1>
              <p className="text-purple-100 mt-1">Dashboard & Management</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">Today's Orders</div>
                <div className="text-3xl font-bold text-purple-600">{stats?.todayOrders || 0}</div>
                <div className="text-sm text-gray-500 mt-2">
                  ${(stats?.todayRevenue || 0).toFixed(2)} revenue
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">Total Orders</div>
                <div className="text-3xl font-bold text-blue-600">{stats?.totalOrders || 0}</div>
                <div className="text-sm text-gray-500 mt-2">
                  ${(stats?.totalRevenue || 0).toFixed(2)} total
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">Active Now</div>
                <div className="text-3xl font-bold text-green-600">{stats?.activeDeliveries || 0}</div>
                <div className="text-sm text-gray-500 mt-2">
                  {stats?.pendingOrders || 0} pending
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">Customers</div>
                <div className="text-3xl font-bold text-orange-600">{stats?.totalCustomers || 0}</div>
                <div className="text-sm text-gray-500 mt-2">
                  {stats?.totalProducts || 0} products
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => router.push('/orders')}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow text-left"
              >
                <div className="text-4xl mb-4">📦</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders Management</h2>
                <p className="text-gray-600">
                  View and manage all orders, update statuses
                </p>
              </button>

              <button
                onClick={() => router.push('/products')}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow text-left"
              >
                <div className="text-4xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
                <p className="text-gray-600">
                  Add, edit, and manage product inventory
                </p>
              </button>

              <button
                onClick={() => router.push('/users')}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow text-left"
              >
                <div className="text-4xl mb-4">👥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Users</h2>
                <p className="text-gray-600">
                  View customers, drivers, and team members
                </p>
              </button>

              <button
                onClick={() => router.push('/analytics')}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow text-left"
              >
                <div className="text-4xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
                <p className="text-gray-600">
                  View sales reports and performance metrics
                </p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
