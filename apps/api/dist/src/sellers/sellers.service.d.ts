import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
export declare class SellersService {
    private readonly prisma;
    private readonly redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    create(dto: CreateSellerDto): Promise<{
        name: string;
        id: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: ListQueryDto): Promise<{
        items: {
            name: string;
            id: string;
            lat: number;
            lng: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findProducts(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        weightKg: number;
        lengthCm: number | null;
        widthCm: number | null;
        heightCm: number | null;
        priceRs: number | null;
        isActive: boolean;
    }[]>;
    update(id: string, dto: UpdateSellerDto): Promise<{
        name: string;
        id: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
