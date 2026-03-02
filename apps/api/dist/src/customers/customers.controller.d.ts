import { ListQueryDto } from '../shared/dto/list-query.dto';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
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
