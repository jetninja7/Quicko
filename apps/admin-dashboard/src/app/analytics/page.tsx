'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  customer: {
    phoneNumber: string;
    firstName?: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

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

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/recent-activity`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (statsRes.status === 401 || ordersRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setRecentOrders(ordersData.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  const averageOrderValue = stats
    ? stats.totalOrders > 0
      ? stats.totalRevenue / stats.totalOrders
      : 0
    : 0;

  const todayAverage = stats
    ? stats.todayOrders > 0
      ? stats.todayRevenue / stats.todayOrders
      : 0
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            <button
              onClick={() => router.push('/')}
              className="text-white hover:text-purple-100"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Total Revenue
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  ${(stats?.totalRevenue || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  From {stats?.totalOrders || 0} orders
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Today's Revenue
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${(stats?.todayRevenue || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  From {stats?.todayOrders || 0} orders
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Average Order Value
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  ${averageOrderValue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-2">All-time average</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Today's Average
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  ${todayAverage.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-2">Per order today</div>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats?.pendingOrders || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Pending</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats?.activeDeliveries || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">In Delivery</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats?.totalCustomers || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Customers</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.totalProducts || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Active Products</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-900">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.replaceAll('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.customer.firstName || order.customer.phoneNumber} •{' '}
                          {order.items.length} item(s) •{' '}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          ${order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Revenue Performance
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today vs All-time Avg</span>
                    <span
                      className={`font-bold ${
                        todayAverage >= averageOrderValue
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {todayAverage >= averageOrderValue ? '↑' : '↓'}{' '}
                      {Math.abs(
                        ((todayAverage - averageOrderValue) / averageOrderValue) * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-bold text-gray-900">
                      {stats?.totalOrders || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Orders Today</span>
                    <span className="font-bold text-gray-900">
                      {stats?.todayOrders || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-green-600">
                      {stats && stats.totalOrders > 0
                        ? (
                            ((stats.totalOrders - stats.pendingOrders) /
                              stats.totalOrders) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Deliveries</span>
                    <span className="font-bold text-blue-600">
                      {stats?.activeDeliveries || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Orders</span>
                    <span className="font-bold text-yellow-600">
                      {stats?.pendingOrders || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
