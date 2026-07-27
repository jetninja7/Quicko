'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  customer: {
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
  };
  store: {
    name: string;
  };
  deliveryDriver?: {
    phoneNumber: string;
    firstName?: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
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
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orders Management</h1>
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
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                statusFilter === ''
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      ${order.total.toFixed(2)}
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Customer</p>
                    <p className="text-gray-600">
                      {order.customer.firstName || order.customer.phoneNumber}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Store</p>
                    <p className="text-gray-600">{order.store.name}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Driver</p>
                    <p className="text-gray-600">
                      {order.deliveryDriver
                        ? order.deliveryDriver.firstName || order.deliveryDriver.phoneNumber
                        : 'Not assigned'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Items ({order.items.length})
                  </p>
                  <div className="text-sm text-gray-600">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}× {item.productName}
                        {idx < Math.min(2, order.items.length - 1) && ', '}
                      </span>
                    ))}
                    {order.items.length > 3 && ` +${order.items.length - 3} more`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
