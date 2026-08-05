import { Router } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types/shared';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.STORE_MANAGER));

// Get low stock alerts
router.get('/low-stock', async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.query;

    const where: any = {
      availableStock: {
        lte: prisma.raw('CAST("lowStockThreshold" AS INTEGER)'),
      },
    };

    if (storeId) {
      where.storeId = storeId;
    }

    const lowStockProducts = await prisma.$queryRaw`
      SELECT
        p.id,
        p.name,
        p.category,
        p."availableStock",
        p."lowStockThreshold",
        p.price,
        p."storeId",
        s.name as "storeName",
        (p."lowStockThreshold" - p."availableStock") as "stockDeficit"
      FROM "Product" p
      JOIN "Store" s ON p."storeId" = s.id
      WHERE p."availableStock" <= p."lowStockThreshold"
      ${storeId ? prisma.raw`AND p."storeId" = ${storeId}` : prisma.raw``}
      ORDER BY (p."lowStockThreshold" - p."availableStock") DESC
    `;

    res.json({
      success: true,
      data: {
        products: lowStockProducts,
        count: (lowStockProducts as any[]).length,
      },
    });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock products',
    });
  }
});

// Get out of stock products
router.get('/out-of-stock', async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.query;

    const where: any = {
      availableStock: 0,
    };

    if (storeId) {
      where.storeId = storeId;
    }

    const outOfStockProducts = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
            city: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        products: outOfStockProducts,
        count: outOfStockProducts.length,
      },
    });
  } catch (error) {
    console.error('Get out of stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch out of stock products',
    });
  }
});

// Update product stock
router.patch('/stock/:productId', async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;
    const { quantity, operation } = req.body;

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a non-negative number',
      });
    }

    if (!['add', 'subtract', 'set'].includes(operation)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation. Use: add, subtract, or set',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    let newStock: number;

    switch (operation) {
      case 'add':
        newStock = product.availableStock + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, product.availableStock - quantity);
        break;
      case 'set':
        newStock = Math.max(0, quantity);
        break;
      default:
        newStock = product.availableStock;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { availableStock: newStock },
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock',
    });
  }
});

// Get inventory report
router.get('/report', async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.query;

    const where: any = {};
    if (storeId) {
      where.storeId = storeId;
    }

    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStockValue,
      productsByCategory,
    ] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.count({
        where: {
          ...where,
          availableStock: {
            lte: 10, // Using default threshold
          },
        },
      }),
      prisma.product.count({
        where: {
          ...where,
          availableStock: 0,
        },
      }),
      prisma.product.aggregate({
        where,
        _sum: {
          availableStock: true,
        },
      }),
      prisma.product.groupBy({
        by: ['category'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          availableStock: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          lowStockCount,
          outOfStockCount,
          totalStockUnits: totalStockValue._sum.availableStock || 0,
        },
        byCategory: productsByCategory.map((cat) => ({
          category: cat.category,
          productCount: cat._count.id,
          totalStock: cat._sum.availableStock || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate inventory report',
    });
  }
});

// Update low stock threshold
router.patch('/threshold/:productId', async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;
    const { threshold } = req.body;

    if (threshold < 0) {
      return res.status(400).json({
        success: false,
        error: 'Threshold must be non-negative',
      });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { lowStockThreshold: threshold },
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update threshold',
    });
  }
});

export default router;
