import { ApiProperty } from '@nestjs/swagger';
import { DeliverySpeed } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class CalculateShippingDto {
  @ApiProperty()
  @IsUUID()
  sellerId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty()
  @IsUUID()
  customerId!: string;

  @ApiProperty({ enum: ['standard', 'express'] })
  @IsEnum(DeliverySpeed)
  deliverySpeed!: DeliverySpeed;
}
