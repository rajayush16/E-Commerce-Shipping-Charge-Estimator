import { CalculateShippingDto } from './dto/calculate-shipping.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { NearestWarehouseQueryDto } from './dto/nearest-warehouse-query.dto';
import { ShippingChargeQueryDto } from './dto/shipping-charge-query.dto';
import { ShippingService } from './shipping.service';
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    getNearestWarehouse(query: NearestWarehouseQueryDto): Promise<{
        warehouseId: string;
        warehouseLocation: {
            lat: number;
            lng: number;
        };
        distanceKm: number;
    }>;
    getShippingCharge(query: ShippingChargeQueryDto): Promise<{
        shippingCharge: number;
        transportMode: import("@prisma/client").TransportMode;
        distanceKm: number;
        breakdown: {
            baseShipping: number;
            courier: number;
            expressExtra: number;
        };
    }>;
    calculateShipping(body: CalculateShippingDto): Promise<{
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
    history(query: HistoryQueryDto): Promise<({
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
}
