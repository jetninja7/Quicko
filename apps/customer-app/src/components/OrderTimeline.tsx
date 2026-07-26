'use client';

interface TimelineStep {
  status: string;
  label: string;
  icon: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { status: 'CONFIRMED', label: 'Order Confirmed', icon: '✓' },
  { status: 'PREPARING', label: 'Preparing Order', icon: '📦' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚗' },
  { status: 'DELIVERED', label: 'Delivered', icon: '🎉' },
];

interface OrderTimelineProps {
  currentStatus: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
}

export function OrderTimeline({
  currentStatus,
  createdAt,
  estimatedDeliveryTime,
  actualDeliveryTime,
}: OrderTimelineProps) {
  const currentStepIndex = TIMELINE_STEPS.findIndex((step) => step.status === currentStatus);

  function isStepCompleted(index: number): boolean {
    return index <= currentStepIndex;
  }

  function isStepActive(index: number): boolean {
    return index === currentStepIndex;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {TIMELINE_STEPS.map((step, index) => (
          <div key={step.status} className="relative pb-8 last:pb-0">
            {index < TIMELINE_STEPS.length - 1 && (
              <div
                className={`absolute left-4 top-8 w-0.5 h-full ${
                  isStepCompleted(index + 1) ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            )}

            <div className="relative flex items-start">
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  isStepCompleted(index)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                } ${isStepActive(index) ? 'ring-4 ring-primary-100' : ''}`}
              >
                <span className="text-sm">{step.icon}</span>
              </div>

              <div className="ml-4 min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isStepCompleted(index) ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>

                {isStepActive(index) && (
                  <p className="mt-1 text-xs text-primary-600 font-medium">In Progress</p>
                )}

                {step.status === 'CONFIRMED' && index === currentStepIndex && (
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(createdAt).toLocaleTimeString()}
                  </p>
                )}

                {step.status === 'DELIVERED' && actualDeliveryTime && (
                  <p className="mt-1 text-xs text-gray-500">
                    Delivered at {new Date(actualDeliveryTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED' && estimatedDeliveryTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Estimated delivery:</span>{' '}
            {new Date(estimatedDeliveryTime).toLocaleTimeString()}
          </p>
        </div>
      )}

      {currentStatus === 'DELIVERED' && actualDeliveryTime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-semibold">
            ✅ Order delivered successfully!
          </p>
        </div>
      )}

      {currentStatus === 'CANCELLED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-semibold">❌ Order was cancelled</p>
        </div>
      )}
    </div>
  );
}
