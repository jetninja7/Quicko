import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyWebhookSignature } from '../services/stripe.service';

const router = Router();
const prisma = new PrismaClient();

router.post(
  '/stripe',
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    try {
      const rawBody = JSON.stringify(req.body);
      const event = await verifyWebhookSignature(rawBody, signature);

      if (event) {
        switch (event.type) {
          case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as any;

            const payment = await prisma.payment.findFirst({
              where: { stripePaymentId: paymentIntent.id },
              include: { order: true },
            });

            if (payment) {
              await prisma.$transaction([
                prisma.payment.update({
                  where: { id: payment.id },
                  data: { status: 'SUCCEEDED' },
                }),
                prisma.order.update({
                  where: { id: payment.orderId },
                  data: {
                    status: 'CONFIRMED',
                    estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes
                  },
                }),
              ]);

              console.log(`✅ Payment succeeded for order ${payment.orderId}`);
            }
            break;
          }

          case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as any;

            const payment = await prisma.payment.findFirst({
              where: { stripePaymentId: paymentIntent.id },
            });

            if (payment) {
              await prisma.$transaction([
                prisma.payment.update({
                  where: { id: payment.id },
                  data: { status: 'FAILED' },
                }),
                prisma.order.update({
                  where: { id: payment.orderId },
                  data: { status: 'CANCELLED' },
                }),
              ]);

              console.log(`❌ Payment failed for order ${payment.orderId}`);
            }
            break;
          }

          default:
            console.log(`Unhandled event type: ${event.type}`);
        }
      } else {
        console.log('🧪 Mock webhook - simulating success');

        const mockPaymentId = req.body.data?.object?.id;
        if (mockPaymentId && mockPaymentId.startsWith('mock_pi_')) {
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentId: mockPaymentId },
          });

          if (payment) {
            await prisma.$transaction([
              prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'SUCCEEDED' },
              }),
              prisma.order.update({
                where: { id: payment.orderId },
                data: {
                  status: 'CONFIRMED',
                  estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000),
                },
              }),
            ]);

            console.log(`✅ Mock payment succeeded for order ${payment.orderId}`);
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
