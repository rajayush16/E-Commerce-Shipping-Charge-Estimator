import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
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
