import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(dto: CreateProductDto): Promise<{
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
    }>;
    findAll(query: ListQueryDto): Promise<{
        items: ({
            seller: {
                name: string;
                id: string;
                lat: number;
                lng: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
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
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<{
        seller: {
            name: string;
            id: string;
            lat: number;
            lng: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
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
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
