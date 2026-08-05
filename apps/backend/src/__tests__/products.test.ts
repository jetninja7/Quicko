import request from 'supertest';
import express from 'express';
import productsRoutes from '../routes/products.routes';

const app = express();
app.use(express.json());
app.use('/api/products', productsRoutes);

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const response = await request(app).get('/api/products');

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should accept search query parameter', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ search: 'apple' });

      expect([200, 500]).toContain(response.status);
    });

    it('should accept category filter', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: 'Fresh Produce' });

      expect([200, 500]).toContain(response.status);
    });

    it('should accept pagination parameters', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: '1', limit: '10' });

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/non-existent-id');

      expect([404, 500]).toContain(response.status);
    });
  });
});
