import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ApiError } from '../shared/api-error';
import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateSellerDto) {
    return this.prisma.seller.create({ data: dto });
  }

  async findAll(query: ListQueryDto) {
    const where: Prisma.SellerWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.seller.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.seller.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const seller = await this.prisma.seller.findUnique({ where: { id } });
    if (!seller) {
      throw new ApiError('SELLER_NOT_FOUND', `Seller ${id} not found`, 404);
    }
    return seller;
  }

  async findProducts(id: string) {
    await this.findOne(id);
    return this.prisma.product.findMany({
      where: { sellerId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateSellerDto) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.seller.update({
      where: { id },
      data: dto,
    });

    if (
      (dto.lat !== undefined && dto.lat !== existing.lat) ||
      (dto.lng !== undefined && dto.lng !== existing.lng)
    ) {
      await this.redisService.invalidateSellerNearestWarehouse(id);
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.seller.delete({ where: { id } });
    await this.redisService.invalidateSellerNearestWarehouse(id);
    return { id };
  }
}
