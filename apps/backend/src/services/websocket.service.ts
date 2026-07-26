import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from '../utils/jwt';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  orderId?: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
      console.log('🔌 New WebSocket connection');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === 'auth') {
            this.handleAuth(ws, data.token, data.orderId);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
        console.log('🔌 WebSocket disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });
    });

    console.log('✅ WebSocket server initialized on /ws');
  }

  private handleAuth(ws: AuthenticatedWebSocket, token: string, orderId: string) {
    try {
      const payload = verifyToken(token);
      ws.userId = payload.userId;
      ws.orderId = orderId;

      if (!this.clients.has(orderId)) {
        this.clients.set(orderId, new Set());
      }
      this.clients.get(orderId)!.add(ws);

      ws.send(
        JSON.stringify({
          type: 'authenticated',
          message: 'Successfully connected to order tracking',
        })
      );

      console.log(`✅ Client authenticated: user=${ws.userId}, order=${orderId}`);
    } catch (error) {
      console.error('Auth error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
      ws.close();
    }
  }

  private removeClient(ws: AuthenticatedWebSocket) {
    if (ws.orderId && this.clients.has(ws.orderId)) {
      this.clients.get(ws.orderId)!.delete(ws);
      if (this.clients.get(ws.orderId)!.size === 0) {
        this.clients.delete(ws.orderId);
      }
    }
  }

  broadcastOrderUpdate(orderId: string, update: any) {
    const orderClients = this.clients.get(orderId);

    if (!orderClients || orderClients.size === 0) {
      console.log(`No clients connected for order ${orderId}`);
      return;
    }

    const message = JSON.stringify({
      type: 'order_update',
      data: update,
    });

    let sentCount = 0;
    orderClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sentCount++;
      }
    });

    console.log(`📤 Broadcast order update to ${sentCount} client(s) for order ${orderId}`);
  }

  getConnectedClients(): number {
    return this.wss ? this.wss.clients.size : 0;
  }

  getOrderConnections(orderId: string): number {
    return this.clients.get(orderId)?.size || 0;
  }
}

export const wsService = new WebSocketService();
