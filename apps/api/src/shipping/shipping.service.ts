import { Injectable } from '@nestjs/common';
import { DeliverySpeed, Prisma, TransportMode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ApiError } from '../shared/api-error';
import { haversineDistanceKm } from './geo.util';
import { calculatePricing, selectTransportMode } from './shipping.constants';

type CachedNearestWarehouse = {
  warehouseId: string;
  warehouseLocation: { lat: number; lng: number };
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

@Injectable()
export class ShippingService {
  private static readonly NEAREST_TTL_SECONDS = 60 * 60 * 24;
  private static readonly SHIPPING_TTL_SECONDS = 60 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getNearestWarehouseForSeller(
    sellerId: string,
  ): Promise<CachedNearestWarehouse> {
    const seller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new ApiError(
        'SELLER_NOT_FOUND',
        `Seller ${sellerId} not found`,
        404,
      );
    }

    const version = await this.redisService.getNearestWarehouseVersion();
    const cacheKey = `nearestWarehouse:v:${version}:seller:${sellerId}`;
    const cached =
      await this.redisService.get<CachedNearestWarehouse>(cacheKey);

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
      throw new ApiError(
        'WAREHOUSE_UNAVAILABLE',
        'No warehouses available',
        503,
      );
    }

    const nearest = warehouses
      .map((warehouse) => ({
        warehouseId: warehouse.id,
        warehouseLocation: { lat: warehouse.lat, lng: warehouse.lng },
        distanceKm: haversineDistanceKm(
          { lat: seller.lat, lng: seller.lng },
          { lat: warehouse.lat, lng: warehouse.lng },
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    await this.redisService.set(
      cacheKey,
      nearest,
      ShippingService.NEAREST_TTL_SECONDS,
    );
    return nearest;
  }

  async getShippingCharge(params: {
    warehouseId: string;
    customerId: string;
    productId: string;
    deliverySpeed: DeliverySpeed;
  }): Promise<CachedShippingCharge> {
    const [warehouse, customer, product] = await Promise.all([
      this.prisma.warehouse.findUnique({ where: { id: params.warehouseId } }),
      this.prisma.customer.findUnique({ where: { id: params.customerId } }),
      this.prisma.product.findUnique({ where: { id: params.productId } }),
    ]);

    if (!warehouse) {
      throw new ApiError(
        'WAREHOUSE_NOT_FOUND',
        `Warehouse ${params.warehouseId} not found`,
        404,
      );
    }
    if (!customer) {
      throw new ApiError(
        'CUSTOMER_NOT_FOUND',
        `Customer ${params.customerId} not found`,
        404,
      );
    }
    if (!product) {
      throw new ApiError(
        'PRODUCT_NOT_FOUND',
        `Product ${params.productId} not found`,
        404,
      );
    }

    if (product.weightKg <= 0) {
      throw new ApiError(
        'INVALID_PRODUCT_WEIGHT',
        'Product weight must be greater than 0',
        422,
      );
    }

    return this.getOrComputeShippingCharge({
      warehouse,
      customer,
      customerId: customer.id,
      deliverySpeed: params.deliverySpeed,
      weightKg: product.weightKg,
    });
  }

  async calculateShipping(params: {
    sellerId: string;
    productId: string;
    customerId: string;
    deliverySpeed: DeliverySpeed;
  }) {
    const [seller, product, customer] = await Promise.all([
      this.prisma.seller.findUnique({ where: { id: params.sellerId } }),
      this.prisma.product.findUnique({ where: { id: params.productId } }),
      this.prisma.customer.findUnique({ where: { id: params.customerId } }),
    ]);

    if (!seller) {
      throw new ApiError(
        'SELLER_NOT_FOUND',
        `Seller ${params.sellerId} not found`,
        404,
      );
    }
    if (!product) {
      throw new ApiError(
        'PRODUCT_NOT_FOUND',
        `Product ${params.productId} not found`,
        404,
      );
    }
    if (!customer) {
      throw new ApiError(
        'CUSTOMER_NOT_FOUND',
        `Customer ${params.customerId} not found`,
        404,
      );
    }
    if (product.sellerId !== seller.id) {
      throw new ApiError(
        'PRODUCT_SELLER_MISMATCH',
        'Product does not belong to the selected seller',
        422,
      );
    }
    if (product.weightKg <= 0) {
      throw new ApiError(
        'INVALID_PRODUCT_WEIGHT',
        'Product weight must be greater than 0',
        422,
      );
    }

    const nearest = await this.getNearestWarehouseForSeller(seller.id);
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: nearest.warehouseId },
    });
    if (!warehouse) {
      throw new ApiError(
        'WAREHOUSE_NOT_FOUND',
        `Warehouse ${nearest.warehouseId} not found`,
        404,
      );
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

  async getHistory(filters: {
    speed?: DeliverySpeed;
    transportMode?: TransportMode;
  }) {
    const where: Prisma.ShippingCalculationWhereInput = {
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

  private async getOrComputeShippingCharge(params: {
    warehouse: { id: string; lat: number; lng: number };
    customer: { lat: number; lng: number };
    customerId: string;
    deliverySpeed: DeliverySpeed;
    weightKg: number;
  }): Promise<CachedShippingCharge> {
    const key = `shippingCharge:wh:${params.warehouse.id}:cust:${params.customerId}:speed:${params.deliverySpeed}:w:${params.weightKg}`;
    const cached = await this.redisService.get<CachedShippingCharge>(key);
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

    const distanceKm = haversineDistanceKm(
      { lat: params.warehouse.lat, lng: params.warehouse.lng },
      { lat: params.customer.lat, lng: params.customer.lng },
    );
    const transportMode = selectTransportMode(distanceKm);
    const pricing = calculatePricing({
      distanceKm,
      weightKg: params.weightKg,
      speed: params.deliverySpeed,
      transportMode,
    });

    const result: CachedShippingCharge = {
      shippingCharge: pricing.totalRs,
      transportMode,
      distanceKm,
      breakdown: {
        baseShipping: pricing.baseShippingRs,
        courier: pricing.courierRs,
        expressExtra: pricing.expressExtraRs,
      },
    };
    await this.redisService.set(
      key,
      result,
      ShippingService.SHIPPING_TTL_SECONDS,
    );
    return result;
  }
}
