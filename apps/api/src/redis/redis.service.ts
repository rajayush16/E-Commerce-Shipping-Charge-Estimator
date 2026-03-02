import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: () => null,
      lazyConnect: true,
    });

    this.client.on('error', (error) => {
      this.logger.warn(
        JSON.stringify({
          type: 'redis_error',
          message: error.message,
        }),
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      // Ignore shutdown errors when redis is not reachable.
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.safe(() => this.client.get(key), null);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.safe(
      () => this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds),
      'OK',
    );
  }

  async del(key: string): Promise<void> {
    await this.safe(() => this.client.del(key), 0);
  }

  async getNearestWarehouseVersion(): Promise<number> {
    const key = 'nearestWarehouse:version';
    const existing = await this.safe(() => this.client.get(key), null);
    if (!existing) {
      await this.safe(() => this.client.set(key, '1'), 'OK');
      return 1;
    }
    return Number(existing);
  }

  async bumpNearestWarehouseVersion(): Promise<number> {
    const version = await this.safe(
      () => this.client.incr('nearestWarehouse:version'),
      1,
    );
    this.logger.log(
      JSON.stringify({
        type: 'cache_invalidation',
        key: 'nearestWarehouse:*',
        strategy: 'prefix_versioning',
        version,
      }),
    );
    return version;
  }

  async invalidateSellerNearestWarehouse(sellerId: string): Promise<void> {
    const version = await this.getNearestWarehouseVersion();
    const key = `nearestWarehouse:v:${version}:seller:${sellerId}`;
    await this.del(key);
  }

  logCacheEvent(payload: Record<string, unknown>): void {
    this.logger.log(JSON.stringify(payload));
  }

  private async safe<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          type: 'redis_unavailable_fallback',
          message:
            error instanceof Error ? error.message : 'Unknown redis error',
        }),
      );
      return fallback;
    }
  }
}
