"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    code;
    message;
    status;
    details;
    constructor(code, message, status, details) {
        super(message);
        this.code = code;
        this.message = message;
        this.status = status;
        this.details = details;
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=api-error.js.map