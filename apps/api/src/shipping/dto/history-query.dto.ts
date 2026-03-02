import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeliverySpeed, TransportMode } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class HistoryQueryDto {
  @ApiPropertyOptional({ enum: ['standard', 'express'] })
  @IsOptional()
  @IsEnum(DeliverySpeed)
  speed?: DeliverySpeed;

  @ApiPropertyOptional({ enum: ['MINI_VAN', 'TRUCK', 'AEROPLANE'] })
  @IsOptional()
  @IsEnum(TransportMode)
  transportMode?: TransportMode;
}
