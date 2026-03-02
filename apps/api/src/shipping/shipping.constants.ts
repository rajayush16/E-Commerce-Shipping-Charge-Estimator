import { DeliverySpeed, TransportMode } from '@prisma/client';

export const COURIER_FIXED_RS = 10;

export const RATE_PER_KM_PER_KG: Record<TransportMode, number> = {
  MINI_VAN: 3,
  TRUCK: 2,
  AEROPLANE: 1,
};

export function selectTransportMode(distanceKm: number): TransportMode {
  if (distanceKm >= 500) {
    return 'AEROPLANE';
  }
  if (distanceKm >= 100) {
    return 'TRUCK';
  }
  return 'MINI_VAN';
}

export function calculatePricing(params: {
  distanceKm: number;
  weightKg: number;
  speed: DeliverySpeed;
  transportMode: TransportMode;
}) {
  const { distanceKm, weightKg, speed, transportMode } = params;
  const baseShipping =
    distanceKm * weightKg * RATE_PER_KM_PER_KG[transportMode];
  const expressExtra = speed === 'express' ? 1.2 * weightKg : 0;
  const total = COURIER_FIXED_RS + baseShipping + expressExtra;

  return {
    baseShippingRs: round2(baseShipping),
    expressExtraRs: round2(expressExtra),
    courierRs: COURIER_FIXED_RS,
    totalRs: round2(total),
  };
}

function round2(num: number): number {
  return Number(num.toFixed(2));
}
