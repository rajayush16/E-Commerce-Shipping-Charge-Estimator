export type ShippingInput = {
  weight: number;
  distance: number;
  service: "standard" | "express";
};

export type ShippingEstimate = {
  shippingCharge: number;
  currency: "INR";
  etaDays: number;
};

const SERVICE_MULTIPLIER: Record<ShippingInput["service"], number> = {
  standard: 1,
  express: 1.65,
};

export async function estimateShipping(input: ShippingInput): Promise<ShippingEstimate> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const base = 35;
  const weightCost = input.weight * 22;
  const distanceCost = input.distance * 1.4;
  const multiplier = SERVICE_MULTIPLIER[input.service];
  const shippingCharge = Number(((base + weightCost + distanceCost) * multiplier).toFixed(2));

  return {
    shippingCharge,
    currency: "INR",
    etaDays: input.service === "express" ? 2 : 5,
  };
}
