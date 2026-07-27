import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@quicko/shared-types';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.STORE_MANAGER));

// Analytics & Stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      pendingOrders,
      activeDeliveries,
      totalCustomers,
      totalProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED' },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'DELIVERED',
          actualDeliveryTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.order.count({
        where: {
          status: { in: ['PREPARING', 'OUT_FOR_DELIVERY'] },
        },
      }),
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      prisma.product.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0,
        pendingOrders,
        activeDeliveries,
        totalCustomers,
        totalProducts,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

// All Orders
router.get('/orders', async (req: AuthRequest, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              phoneNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          store: {
            select: {
              name: true,
            },
          },
          deliveryDriver: {
            select: {
              phoneNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: orders,
        total,
        page: parseInt(page as string),
        pageSize: parseInt(limit as string),
        hasMore: skip + orders.length < total,
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

// All Users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const { role } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

// Product Management
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().min(0),
  unit: z.string(),
  availableStock: z.number().min(0),
  imageUrl: z.string().optional(),
  storeId: z.string(),
});

router.post('/products', async (req: AuthRequest, res) => {
  try {
    const data = productSchema.parse(req.body);

    const product = await prisma.product.create({
      data,
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  }
});

router.patch('/products/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
});

// Recent Activity
router.get('/recent-activity', async (req: AuthRequest, res) => {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            phoneNumber: true,
            firstName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: recentOrders,
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
    });
  }
});

export default router;
