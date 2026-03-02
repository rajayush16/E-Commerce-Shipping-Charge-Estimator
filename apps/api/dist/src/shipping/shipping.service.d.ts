import { DeliverySpeed, TransportMode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
type CachedNearestWarehouse = {
    warehouseId: string;
    warehouseLocation: {
        lat: number;
        lng: number;
    };
    distanceKm: number;
};
type CachedShippingCharge = {
    shippingCharge: number;
    transportMode: TransportMode;
    distanceKm: number;
    breakdown: {
        baseShipping: number;
        courier: number;
        expressExtra: number;
    };
};
export declare class ShippingService {
    private readonly prisma;
    private readonly redisService;
    private static readonly NEAREST_TTL_SECONDS;
    private static readonly SHIPPING_TTL_SECONDS;
    constructor(prisma: PrismaService, redisService: RedisService);
    getNearestWarehouseForSeller(sellerId: string): Promise<CachedNearestWarehouse>;
    getShippingCharge(params: {
        warehouseId: string;
        customerId: string;
        productId: string;
        deliverySpeed: DeliverySpeed;
    }): Promise<CachedShippingCharge>;
    calculateShipping(params: {
        sellerId: string;
        productId: string;
        customerId: string;
        deliverySpeed: DeliverySpeed;
    }): Promise<{
        shippingCharge: number;
        nearestWarehouse: {
            warehouseId: string;
            warehouseLocation: {
                lat: number;
                lng: number;
            };
        };
        sellerToWarehouseKm: number;
        warehouseToCustomerKm: number;
        transportMode: import("@prisma/client").$Enums.TransportMode;
        breakdown: {
            baseShipping: number;
            courier: number;
            expressExtra: number;
        };
    }>;
    getHistory(filters: {
        speed?: DeliverySpeed;
        transportMode?: TransportMode;
    }): Promise<({
        warehouse: {
            name: string;
            id: string;
            lat: number;
            lng: number;
            createdAt: Date;
            updatedAt: Date;
        };
        seller: {
            name: string;
            id: string;
            lat: number;
            lng: number;
            createdAt: Date;
            updatedAt: Date;
        };
        customer: {
            name: string;
            id: string;
            lat: number;
            lng: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            addressLabel: string | null;
        };
        product: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sellerId: string;
            weightKg: number;
            lengthCm: number | null;
            widthCm: number | null;
            heightCm: number | null;
            priceRs: number | null;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        sellerId: string;
        productId: string;
        customerId: string;
        deliverySpeed: import("@prisma/client").$Enums.DeliverySpeed;
        transportMode: import("@prisma/client").$Enums.TransportMode;
        warehouseId: string;
        sellerToWarehouseKm: number;
        warehouseToCustomerKm: number;
        baseShippingRs: number;
        expressExtraRs: number;
        courierRs: number;
        totalRs: number;
    })[]>;
    private getOrComputeShippingCharge;
}
export {};
