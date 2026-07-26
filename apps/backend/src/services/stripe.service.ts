import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key') {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
  console.log('✅ Stripe initialized');
} else {
  console.warn('⚠️  Stripe not configured. Using mock payment mode.');
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  if (!stripe) {
    const mockClientSecret = `mock_secret_${Date.now()}`;
    const mockPaymentIntentId = `mock_pi_${Date.now()}`;

    console.log('🧪 Mock payment intent created:', {
      amount,
      currency,
      clientSecret: mockClientSecret,
      paymentIntentId: mockPaymentIntentId,
    });

    return {
      clientSecret: mockClientSecret,
      paymentIntentId: mockPaymentIntentId,
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<Stripe.Event | null> {
  if (!stripe) {
    console.log('🧪 Mock webhook verification - assuming valid');
    return null;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}

export { stripe };
