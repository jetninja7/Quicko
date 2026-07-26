import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';
import { createPaymentIntent } from '../services/stripe.service';
import { wsService } from '../services/websocket.service';
import { UserRole } from '@quicko/shared-types';

const router = Router();
const prisma = new PrismaClient();

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
  addressId: z.string(),
});

const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
});

const TAX_RATE = 0.0875;
const DELIVERY_FEE = 4.99;

router.use(authenticate);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { items, addressId } = createOrderSchema.parse(req.body);

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
      });
    }

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { store: true },
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        error: 'Some products not found',
      });
    }

    const storeId = products[0].storeId;
    const allSameStore = products.every((p) => p.storeId === storeId);

    if (!allSameStore) {
      return res.status(400).json({
        success: false,
        error: 'All items must be from the same store',
      });
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product?.name}`,
        });
      }
    }

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
      };
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_FEE;

    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      total,
      'usd',
      {
        userId: req.user!.userId,
        storeId,
      }
    );

    const order = await prisma.order.create({
      data: {
        customerId: req.user!.userId,
        storeId,
        addressId,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        tax,
        total,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        address: true,
        store: true,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentId: paymentIntentId,
        amount: total,
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      data: {
        order,
        clientSecret,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

router.patch('/:id/status', authorize(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.DELIVERY_DRIVER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        store: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'DELIVERED' && {
          actualDeliveryTime: new Date(),
        }),
      },
      include: {
        items: true,
        address: true,
        store: true,
        payment: true,
      },
    });

    wsService.broadcastOrderUpdate(id, {
      orderId: id,
      status: updatedOrder.status,
      estimatedDeliveryTime: updatedOrder.estimatedDeliveryTime,
      actualDeliveryTime: updatedOrder.actualDeliveryTime,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
    });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.userId },
      include: {
        items: true,
        address: true,
        store: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        customerId: req.user!.userId,
      },
      include: {
        items: true,
        address: true,
        store: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
});

export default router;
