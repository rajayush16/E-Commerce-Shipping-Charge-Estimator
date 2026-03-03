import { calculatePricing, selectTransportMode } from './shipping.constants';

describe('selectTransportMode', () => {
  it('uses MINI_VAN below 100 km', () => {
    expect(selectTransportMode(99.99)).toBe('MINI_VAN');
  });

  it('uses TRUCK at 100 km', () => {
    expect(selectTransportMode(100)).toBe('TRUCK');
  });

  it('uses TRUCK below 500 km', () => {
    expect(selectTransportMode(499.99)).toBe('TRUCK');
  });

  it('uses AEROPLANE at 500 km', () => {
    expect(selectTransportMode(500)).toBe('AEROPLANE');
  });
});

describe('calculatePricing', () => {
  it('computes standard pricing', () => {
    const pricing = calculatePricing({
      distanceKm: 120,
      weightKg: 2,
      speed: 'standard',
      transportMode: 'TRUCK',
    });

    expect(pricing.baseShippingRs).toBe(480);
    expect(pricing.expressExtraRs).toBe(0);
    expect(pricing.courierRs).toBe(10);
    expect(pricing.totalRs).toBe(490);
  });

  it('computes express pricing', () => {
    const pricing = calculatePricing({
      distanceKm: 120,
      weightKg: 2,
      speed: 'express',
      transportMode: 'TRUCK',
    });

    expect(pricing.baseShippingRs).toBe(480);
    expect(pricing.expressExtraRs).toBe(2.4);
    expect(pricing.courierRs).toBe(10);
    expect(pricing.totalRs).toBe(492.4);
  });
});
