import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { ShippingController } from '../src/shipping/shipping.controller';
import { ShippingService } from '../src/shipping/shipping.service';
import { HttpExceptionFilter } from '../src/shared/http-exception.filter';
import { ResponseInterceptor } from '../src/shared/response.interceptor';

class InMemoryRedisService {
  private readonly storage = new Map<string, string>();

  get<T>(key: string): Promise<T | null> {
    const raw = this.storage.get(key);
    return Promise.resolve(raw ? (JSON.parse(raw) as T) : null);
  }

  set(key: string, value: unknown): Promise<void> {
    this.storage.set(key, JSON.stringify(value));
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }

  getNearestWarehouseVersion(): Promise<number> {
    return Promise.resolve(1);
  }

  bumpNearestWarehouseVersion(): Promise<number> {
    return Promise.resolve(2);
  }

  invalidateSellerNearestWarehouse(): Promise<void> {
    return Promise.resolve();
  }

  logCacheEvent(): void {
    return;
  }
}

class InMemoryPrismaService {
  seller = {
    findUnique: jest.fn(({ where }: { where: { id: string } }) =>
      where.id === '550e8400-e29b-41d4-a716-446655440000'
        ? { id: '550e8400-e29b-41d4-a716-446655440000', lat: 28.61, lng: 77.2 }
        : null,
    ),
  };

  product = {
    findUnique: jest.fn(({ where }: { where: { id: string } }) =>
      where.id === '550e8400-e29b-41d4-a716-446655440001'
        ? {
            id: '550e8400-e29b-41d4-a716-446655440001',
            sellerId: '550e8400-e29b-41d4-a716-446655440000',
            weightKg: 2,
          }
        : null,
    ),
  };

  customer = {
    findUnique: jest.fn(({ where }: { where: { id: string } }) =>
      where.id === '550e8400-e29b-41d4-a716-446655440002'
        ? { id: '550e8400-e29b-41d4-a716-446655440002', lat: 28.7, lng: 77.1 }
        : null,
    ),
  };

  warehouse = {
    findMany: jest.fn(() =>
      Promise.resolve([
        { id: '550e8400-e29b-41d4-a716-446655440003', lat: 28.68, lng: 77.12 },
      ]),
    ),
    findUnique: jest.fn(({ where }: { where: { id: string } }) =>
      where.id === '550e8400-e29b-41d4-a716-446655440003'
        ? { id: '550e8400-e29b-41d4-a716-446655440003', lat: 28.68, lng: 77.12 }
        : null,
    ),
  };

  shippingCalculation = {
    create: jest.fn(() => Promise.resolve()),
    findMany: jest.fn(() => Promise.resolve([])),
  };
}

describe('Shipping calculate endpoint (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ShippingController],
      providers: [
        ShippingService,
        { provide: PrismaService, useClass: InMemoryPrismaService },
        { provide: RedisService, useClass: InMemoryRedisService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('calculates shipping and returns wrapped response', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const res = await request(httpServer)
      .post('/api/v1/shipping-charge/calculate')
      .send({
        sellerId: '550e8400-e29b-41d4-a716-446655440000',
        productId: '550e8400-e29b-41d4-a716-446655440001',
        customerId: '550e8400-e29b-41d4-a716-446655440002',
        deliverySpeed: 'standard',
      })
      .expect(201);

    const body = res.body as {
      success: boolean;
      data: Record<string, unknown>;
    };
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('shippingCharge');
    expect(body.data).toHaveProperty('transportMode');
    expect(body.data).toHaveProperty('nearestWarehouse');
    expect(body.data).toHaveProperty('breakdown');
  });
});
