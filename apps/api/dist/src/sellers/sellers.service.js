"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const api_error_1 = require("../shared/api-error");
let SellersService = class SellersService {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async create(dto) {
        return this.prisma.seller.create({ data: dto });
    }
    async findAll(query) {
        const where = query.search
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
    async findOne(id) {
        const seller = await this.prisma.seller.findUnique({ where: { id } });
        if (!seller) {
            throw new api_error_1.ApiError('SELLER_NOT_FOUND', `Seller ${id} not found`, 404);
        }
        return seller;
    }
    async findProducts(id) {
        await this.findOne(id);
        return this.prisma.product.findMany({
            where: { sellerId: id },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        const updated = await this.prisma.seller.update({
            where: { id },
            data: dto,
        });
        if ((dto.lat !== undefined && dto.lat !== existing.lat) ||
            (dto.lng !== undefined && dto.lng !== existing.lng)) {
            await this.redisService.invalidateSellerNearestWarehouse(id);
        }
        return updated;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.seller.delete({ where: { id } });
        await this.redisService.invalidateSellerNearestWarehouse(id);
        return { id };
    }
};
exports.SellersService = SellersService;
exports.SellersService = SellersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], SellersService);
//# sourceMappingURL=sellers.service.js.map