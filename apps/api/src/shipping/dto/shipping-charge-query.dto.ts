import { ApiProperty } from '@nestjs/swagger';
import { DeliverySpeed } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class ShippingChargeQueryDto {
  @ApiProperty()
  @IsUUID()
  warehouseId!: string;

  @ApiProperty()
  @IsUUID()
  customerId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ enum: ['standard', 'express'] })
  @IsEnum(DeliverySpeed)
  deliverySpeed!: DeliverySpeed;
}
