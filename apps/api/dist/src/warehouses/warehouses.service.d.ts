import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
export declare class WarehousesService {
    private readonly prisma;
    private readonly redisService;
    constructor(prisma: PrismaService, redisService: RedisService);
    create(dto: CreateWarehouseDto): Promise<{
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
    update(id: string, dto: UpdateWarehouseDto): Promise<{
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
