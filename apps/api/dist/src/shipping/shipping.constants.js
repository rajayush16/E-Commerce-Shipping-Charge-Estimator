"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_PER_KM_PER_KG = exports.COURIER_FIXED_RS = void 0;
exports.selectTransportMode = selectTransportMode;
exports.calculatePricing = calculatePricing;
exports.COURIER_FIXED_RS = 10;
exports.RATE_PER_KM_PER_KG = {
    MINI_VAN: 3,
    TRUCK: 2,
    AEROPLANE: 1,
};
function selectTransportMode(distanceKm) {
    if (distanceKm >= 500) {
        return 'AEROPLANE';
    }
    if (distanceKm >= 100) {
        return 'TRUCK';
    }
    return 'MINI_VAN';
}
function calculatePricing(params) {
    const { distanceKm, weightKg, speed, transportMode } = params;
    const baseShipping = distanceKm * weightKg * exports.RATE_PER_KM_PER_KG[transportMode];
    const expressExtra = speed === 'express' ? 1.2 * weightKg : 0;
    const total = exports.COURIER_FIXED_RS + baseShipping + expressExtra;
    return {
        baseShippingRs: round2(baseShipping),
        expressExtraRs: round2(expressExtra),
        courierRs: exports.COURIER_FIXED_RS,
        totalRs: round2(total),
    };
}
function round2(num) {
    return Number(num.toFixed(2));
}
//# sourceMappingURL=shipping.constants.js.map