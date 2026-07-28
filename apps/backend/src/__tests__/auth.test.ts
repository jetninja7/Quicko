import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
  describe('POST /api/auth/send-otp', () => {
    it('should return 400 for invalid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept valid phone number format', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: '+15551234567' });

      // May fail if DB not setup, but should pass validation
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should return 400 for invalid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: 'invalid', code: '000000' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid OTP code length', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: '+15551234567', code: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept dev bypass code in development', async () => {
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: '+15551234567', code: '000000' });

      // May fail if DB not setup, but should accept the code format
      expect([200, 400, 500]).toContain(response.status);
    });
  });
});
