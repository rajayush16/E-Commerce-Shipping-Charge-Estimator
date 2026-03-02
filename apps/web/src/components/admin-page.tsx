"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type Customer, type Product, type Seller, type Warehouse } from "@/lib/api";

const sellerSchema = z.object({
  name: z.string().min(2),
  lat: z.number(),
  lng: z.number(),
});
const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  lat: z.number(),
  lng: z.number(),
  addressLabel: z.string().optional(),
});
const warehouseSchema = z.object({
  name: z.string().min(2),
  lat: z.number(),
  lng: z.number(),
});
const productSchema = z.object({
  name: z.string().min(2),
  sellerId: z.string().uuid("Select seller"),
  weightKg: z.number().positive(),
  priceRs: z.number().optional(),
  lengthCm: z.number().positive().optional(),
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
});

type SellerForm = z.infer<typeof sellerSchema>;
type CustomerForm = z.infer<typeof customerSchema>;
type WarehouseForm = z.infer<typeof warehouseSchema>;
type ProductForm = z.infer<typeof productSchema>;

export function AdminPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const sellersQuery = useQuery({
    queryKey: ["sellers", "admin", search],
    queryFn: () => api.getSellers(search),
  });
  const customersQuery = useQuery({
    queryKey: ["customers", "admin", search],
    queryFn: () => api.getCustomers(search),
  });
  const warehousesQuery = useQuery({
    queryKey: ["warehouses", "admin", search],
    queryFn: () => api.getWarehouses(search),
  });
  const productsQuery = useQuery({
    queryKey: ["products", "admin", search],
    queryFn: () => api.getProducts(search),
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["sellers"] });
    await queryClient.invalidateQueries({ queryKey: ["customers"] });
    await queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const deleteSeller = useMutation({
    mutationFn: api.deleteSeller,
    onSuccess: async () => {
      toast.success("Seller deleted");
      await invalidateAll();
    },
    onError: () => toast.error("Failed to delete seller"),
  });
  const deleteCustomer = useMutation({
    mutationFn: api.deleteCustomer,
    onSuccess: async () => {
      toast.success("Customer deleted");
      await invalidateAll();
    },
    onError: () => toast.error("Failed to delete customer"),
  });
  const deleteWarehouse = useMutation({
    mutationFn: api.deleteWarehouse,
    onSuccess: async () => {
      toast.success("Warehouse deleted");
      await invalidateAll();
    },
    onError: () => toast.error("Failed to delete warehouse"),
  });
  const deleteProduct = useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: async () => {
      toast.success("Product deleted");
      await invalidateAll();
    },
    onError: () => toast.error("Failed to delete product"),
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">Manage customers, sellers, products, and warehouses.</p>
        </div>
        <Input
          placeholder="Search in current tab..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-3">
          <div className="flex justify-end">
            <CustomerModal
              onSaved={invalidateAll}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add new
                </Button>
              }
            />
          </div>
          {customersQuery.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(customersQuery.data?.items ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>
                      {row.lat}, {row.lng}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CustomerModal item={row} onSaved={invalidateAll} trigger={<Button size="sm" variant="outline"><Pencil className="h-4 w-4" /></Button>} />
                        <Button size="sm" variant="destructive" onClick={() => deleteCustomer.mutate(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="sellers" className="space-y-3">
          <div className="flex justify-end">
            <SellerModal
              onSaved={invalidateAll}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add new
                </Button>
              }
            />
          </div>
          {sellersQuery.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sellersQuery.data?.items ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      {row.lat}, {row.lng}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <SellerModal item={row} onSaved={invalidateAll} trigger={<Button size="sm" variant="outline"><Pencil className="h-4 w-4" /></Button>} />
                        <Button size="sm" variant="destructive" onClick={() => deleteSeller.mutate(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-3">
          <div className="flex justify-end">
            <ProductModal
              sellers={sellersQuery.data?.items ?? []}
              onSaved={invalidateAll}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add new
                </Button>
              }
            />
          </div>
          {productsQuery.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Attributes</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(productsQuery.data?.items ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.priceRs ? `Rs ${row.priceRs}` : "-"}</TableCell>
                    <TableCell>{formatProductAttributes(row)}</TableCell>
                    <TableCell>{row.seller?.name ?? row.sellerId.slice(0, 8)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ProductModal
                          item={row}
                          sellers={sellersQuery.data?.items ?? []}
                          onSaved={invalidateAll}
                          trigger={<Button size="sm" variant="outline"><Pencil className="h-4 w-4" /></Button>}
                        />
                        <Button size="sm" variant="destructive" onClick={() => deleteProduct.mutate(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-3">
          <div className="flex justify-end">
            <WarehouseModal
              onSaved={invalidateAll}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add new
                </Button>
              }
            />
          </div>
          {warehousesQuery.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(warehousesQuery.data?.items ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      {row.lat}, {row.lng}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <WarehouseModal item={row} onSaved={invalidateAll} trigger={<Button size="sm" variant="outline"><Pencil className="h-4 w-4" /></Button>} />
                        <Button size="sm" variant="destructive" onClick={() => deleteWarehouse.mutate(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

function SellerModal({
  item,
  trigger,
  onSaved,
}: {
  item?: Seller;
  trigger: React.ReactNode;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<SellerForm>({
    resolver: zodResolver(sellerSchema),
    defaultValues: item ? { name: item.name, lat: item.lat, lng: item.lng } : { name: "", lat: 0, lng: 0 },
  });
  const mutation = useMutation({
    mutationFn: (values: SellerForm) => (item ? api.updateSeller(item.id, values) : api.createSeller(values)),
    onSuccess: async () => {
      toast.success(item ? "Seller updated" : "Seller created");
      await onSaved();
      setOpen(false);
    },
    onError: () => toast.error("Failed to save seller"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit seller" : "Add seller"}</DialogTitle>
          <DialogDescription>Keep seller location accurate for nearest warehouse calculations.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <SimpleField form={form} name="name" label="Name" />
            <SimpleField form={form} name="lat" label="Latitude" type="number" />
            <SimpleField form={form} name="lng" label="Longitude" type="number" />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerModal({
  item,
  trigger,
  onSaved,
}: {
  item?: Customer;
  trigger: React.ReactNode;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: item
      ? { name: item.name, phone: item.phone, lat: item.lat, lng: item.lng, addressLabel: item.addressLabel ?? "" }
      : { name: "", phone: "", lat: 0, lng: 0, addressLabel: "" },
  });
  const mutation = useMutation({
    mutationFn: (values: CustomerForm) =>
      item ? api.updateCustomer(item.id, values) : api.createCustomer(values),
    onSuccess: async () => {
      toast.success(item ? "Customer updated" : "Customer created");
      await onSaved();
      setOpen(false);
    },
    onError: () => toast.error("Failed to save customer"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>Customer location is used to calculate shipment distance.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <SimpleField form={form} name="name" label="Name" />
            <SimpleField form={form} name="phone" label="Phone" />
            <SimpleField form={form} name="lat" label="Latitude" type="number" />
            <SimpleField form={form} name="lng" label="Longitude" type="number" />
            <SimpleField form={form} name="addressLabel" label="Address label" />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function WarehouseModal({
  item,
  trigger,
  onSaved,
}: {
  item?: Warehouse;
  trigger: React.ReactNode;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<WarehouseForm>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: item ? { name: item.name, lat: item.lat, lng: item.lng } : { name: "", lat: 0, lng: 0 },
  });
  const mutation = useMutation({
    mutationFn: (values: WarehouseForm) =>
      item ? api.updateWarehouse(item.id, values) : api.createWarehouse(values),
    onSuccess: async () => {
      toast.success(item ? "Warehouse updated" : "Warehouse created");
      await onSaved();
      setOpen(false);
    },
    onError: () => toast.error("Failed to save warehouse"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit warehouse" : "Add warehouse"}</DialogTitle>
          <DialogDescription>Warehouse changes invalidate nearest-warehouse cache entries.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <SimpleField form={form} name="name" label="Name" />
            <SimpleField form={form} name="lat" label="Latitude" type="number" />
            <SimpleField form={form} name="lng" label="Longitude" type="number" />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ProductModal({
  item,
  sellers,
  trigger,
  onSaved,
}: {
  item?: Product;
  sellers: Seller[];
  trigger: React.ReactNode;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: item
      ? {
          name: item.name,
          sellerId: item.sellerId,
          weightKg: item.weightKg,
          priceRs: item.priceRs ?? undefined,
          lengthCm: item.lengthCm ?? undefined,
          widthCm: item.widthCm ?? undefined,
          heightCm: item.heightCm ?? undefined,
        }
      : {
          name: "",
          sellerId: sellers[0]?.id ?? "",
          weightKg: 1,
          priceRs: undefined,
          lengthCm: undefined,
          widthCm: undefined,
          heightCm: undefined,
        },
  });
  const mutation = useMutation({
    mutationFn: (values: ProductForm) =>
      item
        ? api.updateProduct(item.id, { ...values, isActive: true })
        : api.createProduct({ ...values, isActive: true }),
    onSuccess: async () => {
      toast.success(item ? "Product updated" : "Product created");
      await onSaved();
      setOpen(false);
    },
    onError: () => toast.error("Failed to save product"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>Product seller and weight directly affect shipping price.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <SimpleField form={form} name="name" label="Name" />
            <FormField
              control={form.control}
              name="sellerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="" disabled>
                        Select seller
                      </option>
                      {sellers.map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SimpleField form={form} name="weightKg" label="Weight (kg)" type="number" />
            <SimpleField form={form} name="priceRs" label="Price (Rs)" type="number" />
            <SimpleField form={form} name="lengthCm" label="Length (cm)" type="number" />
            <SimpleField form={form} name="widthCm" label="Width (cm)" type="number" />
            <SimpleField form={form} name="heightCm" label="Height (cm)" type="number" />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function formatProductAttributes(product: Product): string {
  const weight = `weight: ${product.weightKg}kg`;
  const hasDimensions =
    product.lengthCm !== null &&
    product.lengthCm !== undefined &&
    product.widthCm !== null &&
    product.widthCm !== undefined &&
    product.heightCm !== null &&
    product.heightCm !== undefined;

  if (!hasDimensions) {
    return `{ ${weight} }`;
  }

  return `{ ${weight}, dimension: ${product.lengthCm}cm x ${product.widthCm}cm x ${product.heightCm}cm }`;
}

function SimpleField<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  type = "text",
}: {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  type?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              value={(field.value as string | number | undefined) ?? ""}
              onChange={(event) => {
                if (type === "number") {
                  const numericValue = event.target.valueAsNumber;
                  field.onChange(Number.isNaN(numericValue) ? undefined : numericValue);
                  return;
                }
                field.onChange(event.target.value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
