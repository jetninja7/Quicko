'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { AddressForm } from '@/components/AddressForm';
import { apiClient } from '@/lib/api-client';

interface Address {
  id: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated, loadUser } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = 4.99;
  const tax = subtotal * 0.0875; // 8.75% California tax
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    if (!isAuthenticated) {
      loadUser().catch(() => {
        router.push('/auth/login');
      });
    }
  }, [isAuthenticated, loadUser, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/products');
    }
  }, [items, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  async function fetchAddresses() {
    setIsLoadingAddresses(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setAddresses(data.data);
        const defaultAddr = data.data.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  }

  async function handleAddAddress(formData: any) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...formData, isDefault: addresses.length === 0 }),
      });

      const data = await response.json();

      if (data.success) {
        setAddresses([...addresses, data.data]);
        setSelectedAddressId(data.data.id);
        setShowAddressForm(false);
      }
    } catch (err) {
      console.error('Failed to add address:', err);
      setError('Failed to save address');
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    setError('');
    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        addressId: selectedAddressId,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Simulate payment success in mock mode
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Trigger mock webhook
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/stripe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_intent.succeeded',
            data: {
              object: {
                id: data.data.clientSecret.replace('mock_secret_', 'mock_pi_'),
              },
            },
          }),
        });

        clearCart();
        router.push(`/orders/${data.data.order.id}`);
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <button
              onClick={() => router.push('/products')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Shopping
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>

              {isLoadingAddresses ? (
                <p className="text-gray-600">Loading addresses...</p>
              ) : showAddressForm ? (
                <AddressForm
                  onSubmit={handleAddAddress}
                  onCancel={() => setShowAddressForm(false)}
                />
              ) : addresses.length === 0 ? (
                <div>
                  <p className="text-gray-600 mb-4">No saved addresses</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-primary-600 font-medium hover:border-primary-600 hover:bg-primary-50"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === address.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        {address.label && (
                          <p className="font-semibold text-gray-900 mb-1">
                            {address.label}
                          </p>
                        )}
                        <p className="text-gray-700">{address.street}</p>
                        <p className="text-gray-700">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-primary-600 font-medium hover:border-primary-600 hover:bg-primary-50"
                  >
                    + Add New Address
                  </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💳 <strong>Demo Mode:</strong> Payment processing is simulated. No real
                charges will be made.
              </p>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (8.75%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId || showAddressForm}
                className="w-full mt-6 px-6 py-4 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isPlacingOrder ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Estimated delivery: 10-30 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
