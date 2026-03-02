import { OnModuleDestroy } from '@nestjs/common';
export declare class RedisService implements OnModuleDestroy {
    private readonly logger;
    private readonly client;
    constructor();
    onModuleDestroy(): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
    del(key: string): Promise<void>;
    getNearestWarehouseVersion(): Promise<number>;
    bumpNearestWarehouseVersion(): Promise<number>;
    invalidateSellerNearestWarehouse(sellerId: string): Promise<void>;
    logCacheEvent(payload: Record<string, unknown>): void;
}
