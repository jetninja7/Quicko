import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import categoriesRoutes from './routes/categories.routes';
import addressesRoutes from './routes/addresses.routes';
import ordersRoutes from './routes/orders.routes';
import webhooksRoutes from './routes/webhooks.routes';
import driverRoutes from './routes/driver.routes';
import adminRoutes from './routes/admin.routes';
import inventoryRoutes from './routes/inventory.routes';
import { wsService } from './services/websocket.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhooksRoutes);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);

const server = createServer(app);

wsService.initialize(server);

server.listen(PORT, () => {
  console.log(`🚀 Quicko Backend running on port ${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth/*`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`   - Categories: http://localhost:${PORT}/api/categories`);
  console.log(`   - Addresses: http://localhost:${PORT}/api/addresses`);
  console.log(`   - Orders: http://localhost:${PORT}/api/orders`);
  console.log(`   - Driver: http://localhost:${PORT}/api/driver`);
  console.log(`   - Admin: http://localhost:${PORT}/api/admin`);
  console.log(`   - Webhooks: http://localhost:${PORT}/api/webhooks/stripe`);
  console.log(`   - WebSocket: ws://localhost:${PORT}/ws`);
});
