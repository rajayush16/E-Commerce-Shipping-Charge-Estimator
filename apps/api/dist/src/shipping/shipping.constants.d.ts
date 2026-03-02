import { DeliverySpeed, TransportMode } from '@prisma/client';
export declare const COURIER_FIXED_RS = 10;
export declare const RATE_PER_KM_PER_KG: Record<TransportMode, number>;
export declare function selectTransportMode(distanceKm: number): TransportMode;
export declare function calculatePricing(params: {
    distanceKm: number;
    weightKg: number;
    speed: DeliverySpeed;
    transportMode: TransportMode;
}): {
    baseShippingRs: number;
    expressExtraRs: number;
    courierRs: number;
    totalRs: number;
};
