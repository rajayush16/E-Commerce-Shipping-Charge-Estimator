import { haversineDistanceKm } from '../../src/shipping/geo.util';

describe('haversineDistanceKm', () => {
  it('calculates 0 for same point', () => {
    expect(
      haversineDistanceKm({ lat: 12, lng: 77 }, { lat: 12, lng: 77 }),
    ).toBe(0);
  });

  it('calculates known distance within tolerance', () => {
    const delhiToMumbai = haversineDistanceKm(
      { lat: 28.6139, lng: 77.209 },
      { lat: 19.076, lng: 72.8777 },
    );
    expect(delhiToMumbai).toBeGreaterThan(1130);
    expect(delhiToMumbai).toBeLessThan(1170);
  });
});
