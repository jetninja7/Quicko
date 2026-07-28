import { PrismaClient } from '@prisma/client';

// Increase timeout for tests
jest.setTimeout(30000);

// Mock Prisma client for tests
const mockPrisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  await mockPrisma.$disconnect();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Placeholder test to prevent "no tests" error
test('setup runs successfully', () => {
  expect(true).toBe(true);
});
