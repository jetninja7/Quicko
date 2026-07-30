import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types/shared';
import { wsService } from '../services/websocket.service';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize(UserRole.DELIVERY_DRIVER));

router.get('/available-orders', async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        deliveryDriverId: null,
      },
      include: {
        items: true,
        address: true,
        store: true,
        customer: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available orders',
    });
  }
});

router.get('/my-deliveries', async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        deliveryDriverId: req.user!.userId,
        status: {
          in: ['PREPARING', 'OUT_FOR_DELIVERY'],
        },
      },
      include: {
        items: true,
        address: true,
        store: true,
        customer: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get my deliveries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deliveries',
    });
  }
});

router.post('/accept-order/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        error: 'Order is not available for pickup',
      });
    }

    if (order.deliveryDriverId) {
      return res.status(400).json({
        success: false,
        error: 'Order already assigned to another driver',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        deliveryDriverId: req.user!.userId,
        status: 'PREPARING',
      },
      include: {
        items: true,
        address: true,
        store: true,
        customer: {
          select: {
            phoneNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    wsService.broadcastOrderUpdate(id, {
      orderId: id,
      status: 'PREPARING',
      timestamp: new Date(),
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept order',
    });
  }
});

router.post('/start-delivery/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryDriverId: req.user!.userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not assigned to you',
      });
    }

    if (order.status !== 'PREPARING') {
      return res.status(400).json({
        success: false,
        error: 'Order is not ready for delivery',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'OUT_FOR_DELIVERY',
      },
      include: {
        items: true,
        address: true,
        store: true,
      },
    });

    wsService.broadcastOrderUpdate(id, {
      orderId: id,
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date(),
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Start delivery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start delivery',
    });
  }
});

router.post('/complete-delivery/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryDriverId: req.user!.userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not assigned to you',
      });
    }

    if (order.status !== 'OUT_FOR_DELIVERY') {
      return res.status(400).json({
        success: false,
        error: 'Order is not out for delivery',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        actualDeliveryTime: new Date(),
      },
      include: {
        items: true,
        address: true,
        store: true,
      },
    });

    wsService.broadcastOrderUpdate(id, {
      orderId: id,
      status: 'DELIVERED',
      actualDeliveryTime: updatedOrder.actualDeliveryTime,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete delivery',
    });
  }
});

router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [totalDeliveries, todayDeliveries] = await Promise.all([
      prisma.order.count({
        where: {
          deliveryDriverId: req.user!.userId,
          status: 'DELIVERED',
        },
      }),
      prisma.order.count({
        where: {
          deliveryDriverId: req.user!.userId,
          status: 'DELIVERED',
          actualDeliveryTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalDeliveries,
        todayDeliveries,
      },
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

export default router;
