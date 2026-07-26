import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses',
    });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = addressSchema.parse(req.body);

    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: req.user!.userId,
        isDefault: req.body.isDefault || false,
      },
    });

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create address',
    });
  }
});

router.patch('/:id/default', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
      });
    }

    await prisma.address.updateMany({
      where: { userId: req.user!.userId, isDefault: true },
      data: { isDefault: false },
    });

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json({
      success: true,
      data: updatedAddress,
    });
  } catch (error) {
    console.error('Update default address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update address',
    });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
      });
    }

    await prisma.address.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Address deleted',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete address',
    });
  }
});

export default router;
