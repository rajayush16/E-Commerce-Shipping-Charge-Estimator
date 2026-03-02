import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { NearestWarehouseQueryDto } from './dto/nearest-warehouse-query.dto';
import { ShippingChargeQueryDto } from './dto/shipping-charge-query.dto';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@Controller()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('warehouse/nearest')
  getNearestWarehouse(@Query() query: NearestWarehouseQueryDto) {
    return this.shippingService.getNearestWarehouseForSeller(query.sellerId);
  }

  @Get('shipping-charge')
  getShippingCharge(@Query() query: ShippingChargeQueryDto) {
    return this.shippingService.getShippingCharge({
      warehouseId: query.warehouseId,
      customerId: query.customerId,
      productId: query.productId,
      deliverySpeed: query.deliverySpeed,
    });
  }

  @Post('shipping-charge/calculate')
  calculateShipping(@Body() body: CalculateShippingDto) {
    return this.shippingService.calculateShipping({
      sellerId: body.sellerId,
      productId: body.productId,
      customerId: body.customerId,
      deliverySpeed: body.deliverySpeed,
    });
  }

  @Get('shipping-charge/history')
  history(@Query() query: HistoryQueryDto) {
    return this.shippingService.getHistory({
      speed: query.speed,
      transportMode: query.transportMode,
    });
  }
}
