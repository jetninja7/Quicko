import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        availableStock: { gt: 0 },
      },
      orderBy: {
        category: 'asc',
      },
    });

    const formattedCategories = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
});

export default router;
