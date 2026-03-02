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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const api_error_1 = require("../shared/api-error");
let WarehousesService = class WarehousesService {
    prisma;
    redisService;
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async create(dto) {
        const warehouse = await this.prisma.warehouse.create({ data: dto });
        await this.redisService.bumpNearestWarehouseVersion();
        return warehouse;
    }
    async findAll(query) {
        const where = query.search
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
    async findOne(id) {
        const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
        if (!warehouse) {
            throw new api_error_1.ApiError('WAREHOUSE_NOT_FOUND', `Warehouse ${id} not found`, 404);
        }
        return warehouse;
    }
    async update(id, dto) {
        await this.findOne(id);
        const warehouse = await this.prisma.warehouse.update({
            where: { id },
            data: dto,
        });
        await this.redisService.bumpNearestWarehouseVersion();
        return warehouse;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.warehouse.delete({ where: { id } });
        await this.redisService.bumpNearestWarehouseVersion();
        return { id };
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map