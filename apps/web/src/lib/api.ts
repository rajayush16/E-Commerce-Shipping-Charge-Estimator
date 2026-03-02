export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: ApiErrorPayload };
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export type DeliverySpeed = "standard" | "express";
export type TransportMode = "MINI_VAN" | "TRUCK" | "AEROPLANE";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  addressLabel?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Seller = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  sellerId: string;
  name: string;
  weightKg: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  priceRs?: number | null;
  isActive: boolean;
  seller?: { name: string };
  createdAt: string;
  updatedAt: string;
};

export type Warehouse = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
};

export type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type CalculationResponse = {
  shippingCharge: number;
  nearestWarehouse: {
    warehouseId: string;
    warehouseLocation: { lat: number; lng: number };
  };
  sellerToWarehouseKm: number;
  warehouseToCustomerKm: number;
  transportMode: TransportMode;
  breakdown: {
    baseShipping: number;
    courier: number;
    expressExtra: number;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
    cache: "no-store",
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw { code: "INVALID_RESPONSE", message: "Failed to parse server response" } as ApiErrorPayload;
  }

  if (!res.ok || payload.success === false) {
    const error = payload.success === false ? payload.error : { code: "HTTP_ERROR", message: res.statusText };
    throw error;
  }

  return payload.data;
}

const toQueryString = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      sp.set(key, String(value));
    }
  }
  const query = sp.toString();
  return query ? `?${query}` : "";
};

export const api = {
  getSellers: (search = "") =>
    request<ListResponse<Seller>>(`/sellers${toQueryString({ search, limit: 100 })}`),
  getCustomers: (search = "") =>
    request<ListResponse<Customer>>(`/customers${toQueryString({ search, limit: 100 })}`),
  getWarehouses: (search = "") =>
    request<ListResponse<Warehouse>>(`/warehouses${toQueryString({ search, limit: 100 })}`),
  getProducts: (search = "") =>
    request<ListResponse<Product>>(`/products${toQueryString({ search, limit: 100 })}`),
  getProductsBySeller: (sellerId: string) => request<Product[]>(`/sellers/${sellerId}/products`),
  calculateShipping: (body: {
    sellerId: string;
    productId: string;
    customerId: string;
    deliverySpeed: DeliverySpeed;
  }) =>
    request<CalculationResponse>("/shipping-charge/calculate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getHistory: (speed?: DeliverySpeed, transportMode?: TransportMode) =>
    request<Array<Record<string, unknown>>>(
      `/shipping-charge/history${toQueryString({ speed, transportMode })}`
    ),
  createCustomer: (body: Omit<Customer, "id" | "createdAt" | "updatedAt">) =>
    request<Customer>("/customers", { method: "POST", body: JSON.stringify(body) }),
  updateCustomer: (id: string, body: Partial<Omit<Customer, "id" | "createdAt" | "updatedAt">>) =>
    request<Customer>(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteCustomer: (id: string) => request<{ id: string }>(`/customers/${id}`, { method: "DELETE" }),
  createSeller: (body: Omit<Seller, "id" | "createdAt" | "updatedAt">) =>
    request<Seller>("/sellers", { method: "POST", body: JSON.stringify(body) }),
  updateSeller: (id: string, body: Partial<Omit<Seller, "id" | "createdAt" | "updatedAt">>) =>
    request<Seller>(`/sellers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteSeller: (id: string) => request<{ id: string }>(`/sellers/${id}`, { method: "DELETE" }),
  createWarehouse: (body: Omit<Warehouse, "id" | "createdAt" | "updatedAt">) =>
    request<Warehouse>("/warehouses", { method: "POST", body: JSON.stringify(body) }),
  updateWarehouse: (id: string, body: Partial<Omit<Warehouse, "id" | "createdAt" | "updatedAt">>) =>
    request<Warehouse>(`/warehouses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteWarehouse: (id: string) => request<{ id: string }>(`/warehouses/${id}`, { method: "DELETE" }),
  createProduct: (body: Omit<Product, "id" | "createdAt" | "updatedAt">) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: string, body: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>) =>
    request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request<{ id: string }>(`/products/${id}`, { method: "DELETE" }),
};
