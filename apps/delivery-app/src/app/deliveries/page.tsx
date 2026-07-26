'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDeliveryTime?: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  store: {
    name: string;
  };
  customer: {
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function ActiveDeliveriesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningOrderId, setActioningOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyDeliveries();
    const interval = setInterval(fetchMyDeliveries, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMyDeliveries() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/driver/my-deliveries`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartDelivery(orderId: string) {
    setActioningOrderId(orderId);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/driver/start-delivery/${orderId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchMyDeliveries();
      } else {
        setError(data.error || 'Failed to start delivery');
      }
    } catch (err) {
      setError('Failed to start delivery');
    } finally {
      setActioningOrderId(null);
    }
  }

  async function handleCompleteDelivery(orderId: string) {
    setActioningOrderId(orderId);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/driver/complete-delivery/${orderId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchMyDeliveries();
      } else {
        setError(data.error || 'Failed to complete delivery');
      }
    } catch (err) {
      setError('Failed to complete delivery');
    } finally {
      setActioningOrderId(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Deliveries</h1>
            <button
              onClick={() => router.push('/')}
              className="text-white hover:text-blue-100"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Deliveries</h2>
            <p className="text-gray-600 mb-6">Accept an order to get started</p>
            <button
              onClick={() => router.push('/available')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              View Available Orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${order.total.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      👤 Customer
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer.firstName || order.customer.lastName
                        ? `${order.customer.firstName || ''} ${
                            order.customer.lastName || ''
                          }`.trim()
                        : 'Customer'}
                    </p>
                    <a
                      href={`tel:${order.customer.phoneNumber}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {order.customer.phoneNumber}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      🏪 Pickup from
                    </p>
                    <p className="text-sm text-gray-600">{order.store.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      📍 Deliver to
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.address.street}
                      <br />
                      {order.address.city}, {order.address.state} {order.address.zipCode}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      🗺️ Open in Maps
                    </a>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      📦 Items ({order.items.length})
                    </p>
                    <div className="text-sm text-gray-600">
                      {order.items.map((item, idx) => (
                        <p key={idx}>
                          {item.quantity}× {item.productName}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => handleStartDelivery(order.id)}
                    disabled={actioningOrderId === order.id}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                  >
                    {actioningOrderId === order.id
                      ? 'Starting...'
                      : '🚗 Start Delivery'}
                  </button>
                )}

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => handleCompleteDelivery(order.id)}
                    disabled={actioningOrderId === order.id}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                  >
                    {actioningOrderId === order.id
                      ? 'Completing...'
                      : '✅ Mark as Delivered'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
