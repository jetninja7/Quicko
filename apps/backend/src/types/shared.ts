// Shared types (copied from packages/shared-types for standalone deployment)

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

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
