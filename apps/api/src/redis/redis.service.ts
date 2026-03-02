import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async getNearestWarehouseVersion(): Promise<number> {
    const key = 'nearestWarehouse:version';
    const existing = await this.client.get(key);
    if (!existing) {
      await this.client.set(key, '1');
      return 1;
    }
    return Number(existing);
  }

  async bumpNearestWarehouseVersion(): Promise<number> {
    const version = await this.client.incr('nearestWarehouse:version');
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
}
