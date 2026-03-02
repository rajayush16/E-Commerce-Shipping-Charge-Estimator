import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ApiError } from '../shared/api-error';
import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.create({ data: dto });
    await this.redisService.bumpNearestWarehouseVersion();
    return warehouse;
  }

  async findAll(query: ListQueryDto) {
    const where: Prisma.WarehouseWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.warehouse.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw new ApiError(
        'WAREHOUSE_NOT_FOUND',
        `Warehouse ${id} not found`,
        404,
      );
    }
    return warehouse;
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);
    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
    await this.redisService.bumpNearestWarehouseVersion();
    return warehouse;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.warehouse.delete({ where: { id } });
    await this.redisService.bumpNearestWarehouseVersion();
    return { id };
  }
}
