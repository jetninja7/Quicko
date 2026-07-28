import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get user's favorite products
router.get('/', async (req: AuthRequest, res) => {
  try {
    const favorites = await prisma.favoriteProduct.findMany({
      where: { userId: req.user!.userId },
      select: {
        id: true,
        productId: true,
        createdAt: true,
      },
    });

    // Fetch product details for each favorite
    const productIds = favorites.map((f) => f.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        store: {
          select: {
            name: true,
            city: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites',
    });
  }
});

// Add product to favorites
router.post('/:productId', async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;

    const favorite = await prisma.favoriteProduct.create({
      data: {
        userId: req.user!.userId,
        productId,
      },
    });

    res.json({
      success: true,
      data: favorite,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Product already in favorites',
      });
    }

    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add favorite',
    });
  }
});

// Remove product from favorites
router.delete('/:productId', async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;

    await prisma.favoriteProduct.deleteMany({
      where: {
        userId: req.user!.userId,
        productId,
      },
    });

    res.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove favorite',
    });
  }
});

// Check if product is favorited
router.get('/check/:productId', async (req: AuthRequest, res) => {
  try {
    const { productId } = req.params;

    const favorite = await prisma.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.userId,
          productId,
        },
      },
    });

    res.json({
      success: true,
      data: { isFavorite: !!favorite },
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check favorite',
    });
  }
});

export default router;
