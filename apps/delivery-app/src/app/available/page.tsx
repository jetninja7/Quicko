'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
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
}

export default function AvailableOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  async function fetchAvailableOrders() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/driver/available-orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.error || 'Failed to load orders');
      }
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcceptOrder(orderId: string) {
    setAcceptingOrderId(orderId);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/driver/accept-order/${orderId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        router.push('/deliveries');
      } else {
        setError(data.error || 'Failed to accept order');
      }
    } catch (err) {
      setError('Failed to accept order');
    } finally {
      setAcceptingOrderId(null);
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
            <h1 className="text-2xl font-bold">Available Orders</h1>
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
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Available</h2>
            <p className="text-gray-600">Check back soon for new deliveries</p>
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
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      📦 Items ({order.items.length})
                    </p>
                    <div className="text-sm text-gray-600">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <p key={idx}>
                          {item.quantity}× {item.productName}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
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
                      {order.address.city}, {order.address.state}{' '}
                      {order.address.zipCode}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  disabled={acceptingOrderId === order.id}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {acceptingOrderId === order.id ? 'Accepting...' : 'Accept Order'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
