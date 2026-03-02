import { DeliverySpeed } from '@prisma/client';
export declare class CalculateShippingDto {
    sellerId: string;
    productId: string;
    customerId: string;
    deliverySpeed: DeliverySpeed;
}
