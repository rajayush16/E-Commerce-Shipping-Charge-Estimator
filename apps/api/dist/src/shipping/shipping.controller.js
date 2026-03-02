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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calculate_shipping_dto_1 = require("./dto/calculate-shipping.dto");
const history_query_dto_1 = require("./dto/history-query.dto");
const nearest_warehouse_query_dto_1 = require("./dto/nearest-warehouse-query.dto");
const shipping_charge_query_dto_1 = require("./dto/shipping-charge-query.dto");
const shipping_service_1 = require("./shipping.service");
let ShippingController = class ShippingController {
    shippingService;
    constructor(shippingService) {
        this.shippingService = shippingService;
    }
    getNearestWarehouse(query) {
        return this.shippingService.getNearestWarehouseForSeller(query.sellerId);
    }
    getShippingCharge(query) {
        return this.shippingService.getShippingCharge({
            warehouseId: query.warehouseId,
            customerId: query.customerId,
            productId: query.productId,
            deliverySpeed: query.deliverySpeed,
        });
    }
    calculateShipping(body) {
        return this.shippingService.calculateShipping({
            sellerId: body.sellerId,
            productId: body.productId,
            customerId: body.customerId,
            deliverySpeed: body.deliverySpeed,
        });
    }
    history(query) {
        return this.shippingService.getHistory({
            speed: query.speed,
            transportMode: query.transportMode,
        });
    }
};
exports.ShippingController = ShippingController;
__decorate([
    (0, common_1.Get)('warehouse/nearest'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nearest_warehouse_query_dto_1.NearestWarehouseQueryDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "getNearestWarehouse", null);
__decorate([
    (0, common_1.Get)('shipping-charge'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shipping_charge_query_dto_1.ShippingChargeQueryDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "getShippingCharge", null);
__decorate([
    (0, common_1.Post)('shipping-charge/calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_shipping_dto_1.CalculateShippingDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "calculateShipping", null);
__decorate([
    (0, common_1.Get)('shipping-charge/history'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [history_query_dto_1.HistoryQueryDto]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "history", null);
exports.ShippingController = ShippingController = __decorate([
    (0, swagger_1.ApiTags)('shipping'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [shipping_service_1.ShippingService])
], ShippingController);
//# sourceMappingURL=shipping.controller.js.map