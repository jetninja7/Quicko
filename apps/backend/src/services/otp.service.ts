import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: any = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.warn('Twilio not configured. OTP will use development bypass mode.');
  }
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(phoneNumber: string): Promise<void> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpVerification.create({
    data: {
      phoneNumber,
      code,
      expiresAt,
    },
  });

  // Always log OTP if Twilio is not configured
  if (!twilioClient) {
    console.log(`📱 OTP for ${phoneNumber}: ${code}`);
    console.log('💡 Use code "123456" to bypass OTP verification');
  }

  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        body: `Your Quicko verification code is: ${code}`,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    } catch (error) {
      console.error('Failed to send SMS via Twilio:', error);
      throw new Error('Failed to send OTP');
    }
  }
}

export async function verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
  // Bypass code works when Twilio is not configured
  if (!twilioClient && code === '123456') {
    console.log('✅ Bypass code used (Twilio not configured)');
    return true;
  }

  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      phoneNumber,
      code,
      verified: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    return false;
  }

  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return true;
}

export async function cleanupExpiredOTPs(): Promise<void> {
  await prisma.otpVerification.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
