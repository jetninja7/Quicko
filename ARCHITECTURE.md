# Quicko Architecture

## System Overview

Quicko is a quick-commerce delivery platform designed for 10-30 minute grocery and essentials delivery in the US market. The system follows a microservices-inspired monorepo architecture with clear separation between customer-facing, delivery, and admin concerns.

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Customer App   │     │  Delivery App   │     │ Admin Dashboard │
│   (Next.js)     │     │   (Next.js)     │     │   (Next.js)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         └───────────────┬───────┴───────────────────────┘
                         │
                         │ REST API / WebSocket
                         │
                 ┌───────▼────────┐
                 │   Backend API   │
                 │  (Express.js)   │
                 └───────┬────────┘
                         │
         ┋───────────────┼───────────────┋
         │               │               │
    ┌────▼────┐    ┌─────▼─────┐   ┌────▼────┐
    │ Twilio  │    │ PostgreSQL │   │ Stripe  │
    │  (OTP)  │    │ (Prisma)   │   │  (Pay)  │
    └─────────┘    └───────────┘   └─────────┘
```

## Technology Decisions

### Why Next.js over React Native for MVP?

**Decision**: Use Next.js (web-first) for customer and delivery apps instead of React Native.

**Rationale**:
- **Faster development**: No simulator overhead, instant hot reload, standard web debugging
- **Instant deployment**: No app store review cycles (critical for MVP iteration)
- **PWA capabilities**: Add-to-homescreen provides native-like UX without app stores
- **Desktop accessibility**: US customers often order from laptops/desktops
- **Team efficiency**: Single deployment pipeline, shared web stack knowledge

**Tradeoffs**:
- Limited access to native device features (acceptable for grocery ordering)
- Slightly less smooth animations vs native (non-critical for this use case)
- No initial app store presence (mitigated by PWA + marketing)

**Migration path**: Next.js components can be wrapped in React Native later if needed, with most UI logic reusable.

### Why Express over Fastify?

**Decision**: Express.js for initial backend API.

**Rationale**:
- Mature ecosystem with extensive middleware support
- Team familiarity (common in full-stack projects)
- Easier onboarding for contributors
- Fastify's performance benefits matter less at MVP scale

**Future consideration**: Migrate to Fastify if benchmarks show bottlenecks.

### Why Prisma over TypeORM?

**Decision**: Prisma ORM for database access.

**Rationale**:
- Type-safe query builder with excellent TypeScript integration
- Intuitive schema-first approach
- Built-in migration system
- Prisma Studio for database GUI during development
- Better developer experience for schema changes

### Why PostgreSQL?

**Decision**: PostgreSQL as primary database.

**Rationale**:
- Robust ACID compliance for financial transactions
- Excellent geospatial support (PostGIS) for delivery routing (future)
- JSON support for flexible data (order metadata, product attributes)
- Strong ecosystem support on all deployment platforms

### Real-time Architecture

**Decision**: WebSockets (ws library) for real-time order tracking.

**Alternatives considered**:
- **Server-Sent Events**: Simpler but unidirectional (no driver → backend communication)
- **Polling**: Higher latency, more server load
- **Socket.IO**: Heavier library, unnecessary features for our use case

**Implementation approach**:
- Customer connects to WebSocket on order placement
- Delivery driver connects when accepting order
- Backend broadcasts status updates to relevant connections
- Fallback to polling for unstable connections

## Data Flow Patterns

### Authentication Flow

```
Customer        Backend           Twilio
   │               │                │
   │───phone #─────▶               │
   │               │───send OTP────▶
   │               │                │
   │◀──pending─────│                │
   │               │                │
   │───OTP code────▶               │
   │               │──verify code──▶
   │               │◀──success─────│
   │◀──JWT token───│                │
```

### Order Placement Flow

```
Customer    Backend    Stripe     Database    WebSocket
   │           │          │           │           │
   │──items────▶         │           │           │
   │           │──create──▶          │           │
   │           │◀─secret──│          │           │
   │◀─intent───│          │           │           │
   │           │                      │           │
   │─confirm───▶          │           │           │
   │           │─finalize─▶          │           │
   │           │          │           │           │
   │           │─────save order──────▶           │
   │           │                      │           │
   │           │───────broadcast status──────────▶
   │           │                      │           │
   │◀─success──│                      │           │
```

## Database Schema Overview

### Core Entities

- **User**: Multi-role entity (customer, driver, admin) with phone-based auth
- **Store**: Micro-fulfillment centers with geolocation
- **Product**: Inventory items linked to stores
- **Order**: Central entity linking customers, stores, drivers, payments
- **Address**: Customer delivery addresses with geolocation
- **Payment**: Stripe payment records
- **OtpVerification**: Short-lived OTP codes for phone authentication

### Key Relationships

```
User (customer) ──1:N─▶ Order
User (driver) ──1:N─▶ Order (as deliveryDriver)
Store ──1:N─▶ Product
Store ──1:N─▶ Order
Order ──1:N─▶ OrderItem
Order ──1:1─▶ Payment
Order ──1:1─▶ Address
```

## Deployment Architecture

### Local Development
- **Database**: Docker Compose (PostgreSQL container)
- **Backend**: `tsx watch` for hot reload
- **Frontend apps**: Next.js dev server with turbo mode
- **Monorepo**: Turborepo for parallel builds and caching

### Production (Railway/Render/AWS)
- **Backend**: Docker container running Node.js
- **Frontend**: Next.js static export or SSR depending on features
- **Database**: Managed PostgreSQL (Railway Postgres / RDS)
- **CDN**: Cloudflare or platform-native CDN for static assets
- **Secrets**: Environment variables via platform dashboard

### Scaling Considerations (Future)

1. **Backend API**: Horizontal scaling behind load balancer
2. **WebSocket**: Sticky sessions or Redis adapter for multi-instance
3. **Database**: Read replicas for product catalog queries
4. **Caching**: Redis for session data and frequently accessed products
5. **CDN**: Static assets and Next.js output

## Security Considerations

### Authentication
- JWT tokens with short expiration (7 days default)
- Phone number verification via Twilio OTP
- Refresh token rotation (future implementation)
- Role-based access control (RBAC) via User.role

### API Security
- Helmet.js for HTTP header security
- CORS restricted to known origins
- Rate limiting (to be implemented)
- Input validation with Zod schemas

### Payment Security
- PCI compliance via Stripe (no card data stored)
- Webhook signature verification
- Payment idempotency keys
- Order amount verification before payment confirmation

### Data Privacy
- Phone numbers hashed in logs
- PII encrypted at rest (future: column-level encryption)
- GDPR-ready user data export (to be implemented)

## Monitoring and Observability

### Planned Integrations
- **Logging**: Winston or Pino with structured JSON logs
- **APM**: Sentry for error tracking
- **Metrics**: Prometheus + Grafana or platform-native dashboards
- **Tracing**: OpenTelemetry for request tracing

### Key Metrics to Track
- Order placement → confirmation time
- Payment success rate
- Average delivery time
- WebSocket connection stability
- API response times (p50, p95, p99)

## Future Architecture Enhancements

1. **Event-Driven Architecture**: Kafka or RabbitMQ for order events
2. **Microservices Split**: Separate payment, notification, inventory services
3. **GraphQL Gateway**: Unified API layer for multiple frontends
4. **Service Mesh**: Istio for inter-service communication (if splitting services)
5. **Geospatial Routing**: PostGIS-powered optimal delivery routing
6. **Machine Learning**: Demand forecasting, dynamic pricing
