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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const api_error_1 = require("../shared/api-error");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        await this.ensureSellerExists(dto.sellerId);
        return this.prisma.product.create({ data: dto });
    }
    async findAll(query) {
        const where = query.search
            ? { name: { contains: query.search, mode: 'insensitive' } }
            : {};
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: { seller: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { seller: true },
        });
        if (!product) {
            throw new api_error_1.ApiError('PRODUCT_NOT_FOUND', `Product ${id} not found`, 404);
        }
        return product;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.sellerId) {
            await this.ensureSellerExists(dto.sellerId);
        }
        return this.prisma.product.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.product.delete({ where: { id } });
        return { id };
    }
    async ensureSellerExists(sellerId) {
        const seller = await this.prisma.seller.findUnique({
            where: { id: sellerId },
        });
        if (!seller) {
            throw new api_error_1.ApiError('SELLER_NOT_FOUND', `Seller ${sellerId} not found`, 404);
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map