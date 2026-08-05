import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { sendOTP, verifyOTP } from '../services/otp.service';
import { signToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../types/shared';

const router = Router();
const prisma = new PrismaClient();

const sendOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+1\d{10}$/, 'Phone number must be in format +1XXXXXXXXXX'),
});

const verifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+1\d{10}$/, 'Phone number must be in format +1XXXXXXXXXX'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = sendOtpSchema.parse(req.body);

    await sendOTP(phoneNumber);

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
    });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, code } = verifyOtpSchema.parse(req.body);

    const isValid = await verifyOTP(phoneNumber, code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber,
          role: UserRole.CUSTOMER,
        },
      });
    }

    const token = signToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role as UserRole,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
    });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
});

export default router;
