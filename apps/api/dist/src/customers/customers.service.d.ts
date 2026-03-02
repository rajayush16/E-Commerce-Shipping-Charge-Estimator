import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCustomerDto): Promise<{
        name: string;
        id: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        addressLabel: string | null;
    }>;
    findAll(query: ListQueryDto): Promise<{
        items: {
            name: string;
            id: string;
            lat: number;
            lng: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            addressLabel: string | null;
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
        phone: string;
        addressLabel: string | null;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        name: string;
        id: string;
        lat: number;
        lng: number;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        addressLabel: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
