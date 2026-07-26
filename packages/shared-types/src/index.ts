// User & Auth types
export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPayload {
  userId: string;
  phoneNumber: string;
  role: UserRole;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DELIVERY_DRIVER = 'DELIVERY_DRIVER',
  STORE_MANAGER = 'STORE_MANAGER',
  ADMIN = 'ADMIN',
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  price: number;
  unit: string;
  availableStock: number;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  deliveryDriverId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Address types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Store types
export interface Store {
  id: string;
  name: string;
  address: Address;
  isActive: boolean;
  operatingHours: string;
  createdAt: Date;
  updatedAt: Date;
}

// Real-time order tracking
export interface OrderTrackingUpdate {
  orderId: string;
  status: OrderStatus;
  estimatedDeliveryTime?: Date;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

// API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
