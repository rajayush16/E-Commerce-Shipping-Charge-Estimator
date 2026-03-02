"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    logger = new common_1.Logger(RedisService_1.name);
    client;
    constructor() {
        this.client = new ioredis_1.default(process.env.REDIS_URL ?? 'redis://localhost:6379');
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    async get(key) {
        const value = await this.client.get(key);
        if (!value) {
            return null;
        }
        return JSON.parse(value);
    }
    async set(key, value, ttlSeconds) {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    }
    async del(key) {
        await this.client.del(key);
    }
    async getNearestWarehouseVersion() {
        const key = 'nearestWarehouse:version';
        const existing = await this.client.get(key);
        if (!existing) {
            await this.client.set(key, '1');
            return 1;
        }
        return Number(existing);
    }
    async bumpNearestWarehouseVersion() {
        const version = await this.client.incr('nearestWarehouse:version');
        this.logger.log(JSON.stringify({
            type: 'cache_invalidation',
            key: 'nearestWarehouse:*',
            strategy: 'prefix_versioning',
            version,
        }));
        return version;
    }
    async invalidateSellerNearestWarehouse(sellerId) {
        const version = await this.getNearestWarehouseVersion();
        const key = `nearestWarehouse:v:${version}:seller:${sellerId}`;
        await this.del(key);
    }
    logCacheEvent(payload) {
        this.logger.log(JSON.stringify(payload));
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map