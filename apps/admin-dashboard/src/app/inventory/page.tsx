'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  availableStock: number;
  lowStockThreshold: number;
  price: number;
  storeName: string;
  stockDeficit: number;
}

interface InventoryReport {
  summary: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStockUnits: number;
  };
  byCategory: Array<{
    category: string;
    productCount: number;
    totalStock: number;
  }>;
}

export default function InventoryPage() {
  const router = useRouter();
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'low-stock' | 'report'>('low-stock');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [lowStockRes, reportRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/low-stock`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/report`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (lowStockRes.status === 401 || reportRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const lowStockData = await lowStockRes.json();
      const reportData = await reportRes.json();

      if (lowStockData.success) {
        setLowStockProducts(lowStockData.data.products);
      }

      if (reportData.success) {
        setReport(reportData.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStock(productId: string, operation: string, quantity: number) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/stock/${productId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ operation, quantity }),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refresh data
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch (err) {
      console.error('Update stock error:', err);
      alert('Failed to update stock');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Inventory Management</h1>
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
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('low-stock')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'low-stock'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Low Stock Alerts
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'report'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Inventory Report
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'low-stock' && (
              <div>
                {lowStockProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-green-600 font-medium">
                      ✓ All products are well stocked!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {product.category} • {product.storeName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              {product.availableStock} units
                            </div>
                            <div className="text-sm text-gray-500">
                              Threshold: {product.lowStockThreshold}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-1">
                              Stock Level
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div
                                className="bg-orange-500 h-4 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (product.availableStock / product.lowStockThreshold) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-red-600 font-semibold">
                            Need: +{product.stockDeficit} units
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStock(product.id, 'add', 10)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            + Add 10
                          </button>
                          <button
                            onClick={() => updateStock(product.id, 'add', 50)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            + Add 50
                          </button>
                          <button
                            onClick={() => updateStock(product.id, 'add', 100)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            + Add 100
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'report' && report && (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Total Products
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {report.summary.totalProducts}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Low Stock
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {report.summary.lowStockCount}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Out of Stock
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {report.summary.outOfStockCount}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Total Stock Units
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {report.summary.totalStockUnits}
                    </div>
                  </div>
                </div>

                {/* By Category */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Stock by Category
                  </h2>
                  <div className="space-y-4">
                    {report.byCategory.map((cat) => (
                      <div key={cat.category} className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {cat.category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cat.productCount} products
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {cat.totalStock}
                          </div>
                          <div className="text-xs text-gray-500">units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
