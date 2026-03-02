import { DeliverySpeed } from '@prisma/client';
export declare class ShippingChargeQueryDto {
    warehouseId: string;
    customerId: string;
    productId: string;
    deliverySpeed: DeliverySpeed;
}
