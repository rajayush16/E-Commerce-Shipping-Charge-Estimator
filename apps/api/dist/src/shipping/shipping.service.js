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
var ShippingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const api_error_1 = require("../shared/api-error");
const geo_util_1 = require("./geo.util");
const shipping_constants_1 = require("./shipping.constants");
let ShippingService = class ShippingService {
    static { ShippingService_1 = this; }
    prisma;
    redisService;
    static NEAREST_TTL_SECONDS = 60 * 60 * 24;
    static SHIPPING_TTL_SECONDS = 60 * 60;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async getNearestWarehouseForSeller(sellerId) {
        const seller = await this.prisma.seller.findUnique({
            where: { id: sellerId },
        });
        if (!seller) {
            throw new api_error_1.ApiError('SELLER_NOT_FOUND', `Seller ${sellerId} not found`, 404);
        }
        const version = await this.redisService.getNearestWarehouseVersion();
        const cacheKey = `nearestWarehouse:v:${version}:seller:${sellerId}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            this.redisService.logCacheEvent({
                type: 'cache_hit',
                key: cacheKey,
                context: 'nearestWarehouse',
            });
            return cached;
        }
        this.redisService.logCacheEvent({
            type: 'cache_miss',
            key: cacheKey,
            context: 'nearestWarehouse',
        });
        const warehouses = await this.prisma.warehouse.findMany();
        if (warehouses.length === 0) {
            throw new api_error_1.ApiError('WAREHOUSE_UNAVAILABLE', 'No warehouses available', 503);
        }
        const nearest = warehouses
            .map((warehouse) => ({
            warehouseId: warehouse.id,
            warehouseLocation: { lat: warehouse.lat, lng: warehouse.lng },
            distanceKm: (0, geo_util_1.haversineDistanceKm)({ lat: seller.lat, lng: seller.lng }, { lat: warehouse.lat, lng: warehouse.lng }),
        }))
            .sort((a, b) => a.distanceKm - b.distanceKm)[0];
        await this.redisService.set(cacheKey, nearest, ShippingService_1.NEAREST_TTL_SECONDS);
        return nearest;
    }
    async getShippingCharge(params) {
        const [warehouse, customer, product] = await Promise.all([
            this.prisma.warehouse.findUnique({ where: { id: params.warehouseId } }),
            this.prisma.customer.findUnique({ where: { id: params.customerId } }),
            this.prisma.product.findUnique({ where: { id: params.productId } }),
        ]);
        if (!warehouse) {
            throw new api_error_1.ApiError('WAREHOUSE_NOT_FOUND', `Warehouse ${params.warehouseId} not found`, 404);
        }
        if (!customer) {
            throw new api_error_1.ApiError('CUSTOMER_NOT_FOUND', `Customer ${params.customerId} not found`, 404);
        }
        if (!product) {
            throw new api_error_1.ApiError('PRODUCT_NOT_FOUND', `Product ${params.productId} not found`, 404);
        }
        if (product.weightKg <= 0) {
            throw new api_error_1.ApiError('INVALID_PRODUCT_WEIGHT', 'Product weight must be greater than 0', 422);
        }
        return this.getOrComputeShippingCharge({
            warehouse,
            customer,
            customerId: customer.id,
            deliverySpeed: params.deliverySpeed,
            weightKg: product.weightKg,
        });
    }
    async calculateShipping(params) {
        const [seller, product, customer] = await Promise.all([
            this.prisma.seller.findUnique({ where: { id: params.sellerId } }),
            this.prisma.product.findUnique({ where: { id: params.productId } }),
            this.prisma.customer.findUnique({ where: { id: params.customerId } }),
        ]);
        if (!seller) {
            throw new api_error_1.ApiError('SELLER_NOT_FOUND', `Seller ${params.sellerId} not found`, 404);
        }
        if (!product) {
            throw new api_error_1.ApiError('PRODUCT_NOT_FOUND', `Product ${params.productId} not found`, 404);
        }
        if (!customer) {
            throw new api_error_1.ApiError('CUSTOMER_NOT_FOUND', `Customer ${params.customerId} not found`, 404);
        }
        if (product.sellerId !== seller.id) {
            throw new api_error_1.ApiError('PRODUCT_SELLER_MISMATCH', 'Product does not belong to the selected seller', 422);
        }
        if (product.weightKg <= 0) {
            throw new api_error_1.ApiError('INVALID_PRODUCT_WEIGHT', 'Product weight must be greater than 0', 422);
        }
        const nearest = await this.getNearestWarehouseForSeller(seller.id);
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id: nearest.warehouseId },
        });
        if (!warehouse) {
            throw new api_error_1.ApiError('WAREHOUSE_NOT_FOUND', `Warehouse ${nearest.warehouseId} not found`, 404);
        }
        const shipping = await this.getOrComputeShippingCharge({
            warehouse,
            customer,
            customerId: customer.id,
            deliverySpeed: params.deliverySpeed,
            weightKg: product.weightKg,
        });
        await this.prisma.shippingCalculation.create({
            data: {
                sellerId: seller.id,
                productId: product.id,
                customerId: customer.id,
                warehouseId: warehouse.id,
                deliverySpeed: params.deliverySpeed,
                sellerToWarehouseKm: nearest.distanceKm,
                warehouseToCustomerKm: shipping.distanceKm,
                transportMode: shipping.transportMode,
                baseShippingRs: shipping.breakdown.baseShipping,
                expressExtraRs: shipping.breakdown.expressExtra,
                courierRs: shipping.breakdown.courier,
                totalRs: shipping.shippingCharge,
            },
        });
        return {
            shippingCharge: shipping.shippingCharge,
            nearestWarehouse: {
                warehouseId: nearest.warehouseId,
                warehouseLocation: nearest.warehouseLocation,
            },
            sellerToWarehouseKm: nearest.distanceKm,
            warehouseToCustomerKm: shipping.distanceKm,
            transportMode: shipping.transportMode,
            breakdown: shipping.breakdown,
        };
    }
    async getHistory(filters) {
        const where = {
            ...(filters.speed ? { deliverySpeed: filters.speed } : {}),
            ...(filters.transportMode
                ? { transportMode: filters.transportMode }
                : {}),
        };
        return this.prisma.shippingCalculation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { seller: true, product: true, customer: true, warehouse: true },
        });
    }
    async getOrComputeShippingCharge(params) {
        const key = `shippingCharge:wh:${params.warehouse.id}:cust:${params.customerId}:speed:${params.deliverySpeed}:w:${params.weightKg}`;
        const cached = await this.redisService.get(key);
        if (cached) {
            this.redisService.logCacheEvent({
                type: 'cache_hit',
                key,
                context: 'shippingCharge',
            });
            return cached;
        }
        this.redisService.logCacheEvent({
            type: 'cache_miss',
            key,
            context: 'shippingCharge',
        });
        const distanceKm = (0, geo_util_1.haversineDistanceKm)({ lat: params.warehouse.lat, lng: params.warehouse.lng }, { lat: params.customer.lat, lng: params.customer.lng });
        const transportMode = (0, shipping_constants_1.selectTransportMode)(distanceKm);
        const pricing = (0, shipping_constants_1.calculatePricing)({
            distanceKm,
            weightKg: params.weightKg,
            speed: params.deliverySpeed,
            transportMode,
        });
        const result = {
            shippingCharge: pricing.totalRs,
            transportMode,
            distanceKm,
            breakdown: {
                baseShipping: pricing.baseShippingRs,
                courier: pricing.courierRs,
                expressExtra: pricing.expressExtraRs,
            },
        };
        await this.redisService.set(key, result, ShippingService_1.SHIPPING_TTL_SECONDS);
        return result;
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = ShippingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map