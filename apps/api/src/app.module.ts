import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from './customers/customers.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { SellersModule } from './sellers/sellers.module';
import { ShippingModule } from './shipping/shipping.module';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    CustomersModule,
    SellersModule,
    ProductsModule,
    WarehousesModule,
    ShippingModule,
  ],
})
export class AppModule {}
