-- Run this in Supabase SQL Editor to set up the database

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    "phoneNumber" TEXT UNIQUE NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- OTP verification table
CREATE TABLE IF NOT EXISTS "OtpVerification" (
    id TEXT PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    code TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "OtpVerification_phoneNumber_code_idx" ON "OtpVerification"("phoneNumber", code);

-- Stores table
CREATE TABLE IF NOT EXISTS "Store" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "operatingHours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");

-- Products table
CREATE TABLE IF NOT EXISTS "Product" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    "imageUrl" TEXT,
    price DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    "availableStock" INTEGER NOT NULL,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "storeId" TEXT NOT NULL REFERENCES "Store"(id),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Product_storeId_idx" ON "Product"("storeId");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"(category);

-- Addresses table
CREATE TABLE IF NOT EXISTS "Address" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    label TEXT,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");

-- Orders table
CREATE TABLE IF NOT EXISTS "Order" (
    id TEXT PRIMARY KEY,
    "customerId" TEXT NOT NULL REFERENCES "User"(id),
    "storeId" TEXT NOT NULL REFERENCES "Store"(id),
    "deliveryDriverId" TEXT REFERENCES "User"(id),
    "addressId" TEXT NOT NULL REFERENCES "Address"(id),
    subtotal DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    tax DOUBLE PRECISION NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "estimatedDeliveryTime" TIMESTAMP(3),
    "actualDeliveryTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Order_storeId_idx" ON "Order"("storeId");
CREATE INDEX IF NOT EXISTS "Order_deliveryDriverId_idx" ON "Order"("deliveryDriverId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"(status);

-- Order items table
CREATE TABLE IF NOT EXISTS "OrderItem" (
    id TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"(id),
    "productName" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    subtotal DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

-- Payment methods table
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "stripePaymentMethodId" TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    last4 TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- Payments table
CREATE TABLE IF NOT EXISTS "Payment" (
    id TEXT PRIMARY KEY,
    "orderId" TEXT UNIQUE NOT NULL REFERENCES "Order"(id),
    "stripePaymentId" TEXT UNIQUE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethodId" TEXT REFERENCES "PaymentMethod"(id),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Payment_stripePaymentId_idx" ON "Payment"("stripePaymentId");

-- Favorite products table
CREATE TABLE IF NOT EXISTS "FavoriteProduct" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "productId")
);

CREATE INDEX IF NOT EXISTS "FavoriteProduct_userId_idx" ON "FavoriteProduct"("userId");
