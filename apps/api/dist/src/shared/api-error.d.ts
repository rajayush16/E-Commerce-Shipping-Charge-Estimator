export declare class ApiError extends Error {
    readonly code: string;
    readonly message: string;
    readonly status: number;
    readonly details?: unknown | undefined;
    constructor(code: string, message: string, status: number, details?: unknown | undefined);
}
